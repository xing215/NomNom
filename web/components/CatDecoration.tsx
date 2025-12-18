import Image from 'next/image';

export default function CatDecoration({ hungry = false }) {
  return (
    <>
      <div className="absolute bottom-0 left-[30px] md:left-[30px] w-[373px] md:w-[600px] h-[227px] md:h-[360px] pointer-events-none">
        <Image
          src="/images/sleeping-cat.png"
          alt="Cat"
          fill
          className="object-contain"
        />
      </div>

      {hungry &&
        <div className="absolute left-[100px] md:left-[160px] z-100 bottom-[100px] md:bottom-[190px] flex items-center justify-center w-[193px] pointer-events-none">
          <div className="rotate-[349.154deg]">
            <div className="relative w-[172px] md:w-[200px] h-[200px]">
              <Image
                src="/images/dream-cat-food.png"
                alt="Cat decoration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      }
    </>
  );
}
