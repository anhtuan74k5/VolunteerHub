#!/usr/bin/env bash
set -euo pipefail

# 1) Login
LOGIN_RESP=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"nguyentruongnam","password":"123456789"}')
echo "[LOGIN_RESP]"
echo "$LOGIN_RESP" | sed -n '1,200p'
# Save to temp file and parse with node to avoid stdin quoting issues
printf '%s' "$LOGIN_RESP" > /tmp/vh_login.json
TOKEN=$(node -e "const fs=require('fs'); try{const r=JSON.parse(fs.readFileSync('/tmp/vh_login.json','utf8')); console.log(r.token||'')}catch(e){console.log('')}" )
echo "[TOKEN]=$TOKEN"

# 2) Get manager events
EVENTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/my-events)
echo "[INFO] Events response:"
echo "$EVENTS" | sed -n '1,200p'

# Save to temp file and parse with node
printf '%s' "$EVENTS" > /tmp/vh_events.json
EVENT_ID=$(node -e "const fs=require('fs'); try{const d=JSON.parse(fs.readFileSync('/tmp/vh_events.json','utf8')); if(Array.isArray(d)&&d.length>0) console.log(d[0]._id||''); else console.log('')}catch(e){console.log('')}" )
if [ -z "$EVENT_ID" ]; then
  echo "No event id found; aborting."
  exit 2
fi
echo "[OK] Using event id: $EVENT_ID"
# 3) Iterate events and find first pending registration
EVENT_IDS=$(node -e "const fs=require('fs'); try{const d=JSON.parse(fs.readFileSync('/tmp/vh_events.json','utf8')); if(Array.isArray(d)) console.log(d.map(e=>e._id).join('\n')); else console.log(''); }catch(e){console.log('')}" )
REG_ID=''
for id in $EVENT_IDS; do
  echo "[INFO] Checking registrations for event: $id"
  PARTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/registrations/$id/participants)
  echo "[INFO] Participants response (truncated):"
  echo "$PARTS" | sed -n '1,80p'
  printf '%s' "$PARTS" > /tmp/vh_parts.json
  REG_ID=$(node -e "const fs=require('fs'); try{const d=JSON.parse(fs.readFileSync('/tmp/vh_parts.json','utf8')); if(Array.isArray(d)){const p=d.find(r=>String(r.status).toUpperCase()==='PENDING'); console.log(p? p._id : '')} else console.log('')}catch(e){console.log('')}" )
  if [ -n "$REG_ID" ]; then
    EVENT_ID=$id
    echo "[OK] Found pending registration id: $REG_ID for event $EVENT_ID"
    break
  fi
done
if [ -z "$REG_ID" ]; then
  echo "No pending registrations found across manager events. Attempting to create one by registering volunteer for the first event."
  # Login as volunteer and register for EVENT_ID (first event)
  VOL_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"anhtuan7474","password":"222222"}')
  printf '%s' "$VOL_LOGIN" > /tmp/vh_vol_login.json
  VOL_TOKEN=$(node -e "const fs=require('fs'); try{const r=JSON.parse(fs.readFileSync('/tmp/vh_vol_login.json','utf8')); console.log(r.token||'')}catch(e){console.log('')}" )
  if [ -z "$VOL_TOKEN" ]; then
    echo "Volunteer login failed; cannot create registration."
    exit 1
  fi
  echo "[OK] Volunteer logged in, attempting registration for event $EVENT_ID"
  REGISTER_RESP=$(curl -s -X POST -H "Authorization: Bearer $VOL_TOKEN" http://localhost:5000/api/registrations/$EVENT_ID)
  echo "[REGISTER_RESP]"
  echo "$REGISTER_RESP" | sed -n '1,200p'
  # Give the server a moment to persist
  sleep 1
  # Re-check participants for this event
  PARTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/registrations/$EVENT_ID/participants)
  printf '%s' "$PARTS" > /tmp/vh_parts.json
  REG_ID=$(node -e "const fs=require('fs'); try{const d=JSON.parse(fs.readFileSync('/tmp/vh_parts.json','utf8')); if(Array.isArray(d)){const p=d.find(r=>String(r.status).toUpperCase()==='PENDING'); console.log(p? p._id : '')} else console.log('')}catch(e){console.log('')}" )
  if [ -z "$REG_ID" ]; then
    echo "Still no pending registration after volunteer registration attempt. Aborting."
    exit 1
  fi
  echo "[OK] New pending registration id: $REG_ID"
fi

# 4) Approve the registration
APP_RESP=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"APPROVED"}' http://localhost:5000/api/registrations/$REG_ID/status)
echo "[RESULT] Approval response:"
echo "$APP_RESP" | sed -n '1,200p'
