import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import HowItWorks from '../components/HowItWorks'
import Business from '../components/Business'
import WhyZylo from '../components/WhyZylo'
import Footer from '../components/Footer'
import './Landing.css'

export default function Landing() {
  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-body overflow-x-hidden selection:bg-[#ff7851] selection:text-[#470e00]">
      <Navbar />
      <Hero />
      <Categories />
      <HowItWorks />
      <Business />
      <WhyZylo />
      <Footer />
    </div>
  )
}
