import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function UserTemplate() {
    return (
        <>
            <Header />
            <main className="pt-[80px]">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
