import Navbar from "../components/Navbar"

function Dashboard() {
    return (
        <section className="min-h-screen overflow-x-hidden relative bg-[#0A0A0A]">
            <div className='absolute z-0 -top-40 -right-20 w-[500px] h-[500px] bg-[#00FFFF]/70 rounded-full blur-[200px]'></div>
            <Navbar />
            
        </section>
    )
}

export default Dashboard