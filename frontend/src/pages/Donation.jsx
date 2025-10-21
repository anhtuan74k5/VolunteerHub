import qr from "../assets/img/qr.jpg"
import { motion } from "framer-motion";
import tim from "../assets/img/tim1.png"

const Donation = () => {
    return (
        <div className="flex  flex-col items-center my-10 gap-5 text-[20px]">
            <h1 className="text-[35px] text-[#DCBA58] font-semibold">Quyên Góp Duy Trì Hoạt Động Tình Nguyện</h1>
            <p className="text-[20px] font-normal">Hãy đóng góp để giúp chúng tôi duy trì các hoạt động tình nguyện và mang lại nhiều lợi ích cho cộng đồng.</p>
            <img
                src={qr}
                alt="QR"
                className="rounded-md w-[350px] h-auto"
            />
            <p className="text-[15px]">Quét mã QR để quyên góp</p>
            <p>Hoặc chuyển khoản qua số tài khoản: 0984688798</p>
            <p>
                <span className="font-semibold">Tên chủ tài khoản:</span> Nguyễn Trường Nam
            </p>
            <p>
                <span className="font-semibold">Ngân hàng:</span> Ngân hàng TMCP Quân Đội (MB)
            </p>
            <p>
                <span className="font-semibold">Cú pháp:</span> Tình nguyện UET - Tên người ủng hộ - Lời nhắn
            </p>
            <p className="flex items-center">
                Cảm ơn bạn đã chung tay để không ai bị bỏ lại phía sau trên hành trình vì cộng đồng, vì sự phát triển của đất nước!
                <span className="ml-2">
                    <div className="relative h-12 w-12 overflow-visible">
                        <motion.img
                            src={tim}
                            alt="hearts"
                            className="absolute bottom-0 left-0 w-full h-full"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: [-10, -20, -40], opacity: [0, 1, 1] }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </span>
            </p>
        </div>
    );

}

export default Donation