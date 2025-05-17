import fauzi from '@/assets/images/fauzi.png'
import fifa from '@/assets/images/fifa.png'
import fkf from '@/assets/images/fkf.png'
import redcross from '@/assets/images/redcross.png'
import puma from '@/assets/images/puma.png'

export default function Sponsers() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-background dark:bg-background/95">
        <div className="container mx-auto px-4">
          {/* Primary Sponsors */}
          <div className="flex flex-wrap  items-center justify-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 md:mb-16">
            <img src={fauzi} alt="fauzi" className="h-28 sm:h-28 dark:bg-gray-100 rounded-lg" />
          </div>
          
          {/* Secondary Sponsors */}
          <div className="grid grid-cols-2 gap-6 dark:bg-gray-100 rounded-lg  sm:gap-8 items-center justify-items-center">
            {/* Row 1 */}
            <img src={fifa} alt="fifa" className="h-20 sm:h-24 rounded-lg" />
            <img src={fkf} alt="fkf" className="h-20 sm:h-24  " />
            
            {/* Row 2 */}
            <img src={redcross} alt="MSport" className=" h-24  " />
            <img src={puma} alt="Predator Energy" className=" h-24  " />
          </div>
        </div>
      </section>
  )
}
