import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import style from "./MainSlider.module.css";

import img1 from "../../assets/images/03918408403-e1.jpg";

import img2 from "../../assets/images/10c8a85ffecbeb503e3a4707279cbc9caaee6aaa_1759222722.webp"
import img3 from "../../assets/images/13ceb9d8c732f53ce5ba31c02107f8c631ebc2ae_1759223115.webp"
import img4 from "../../assets/images/301d9b258c4e45156779f47b76984f655f7282f9_1759222826.webp"
import img5 from "../../assets/images/402315bafbe3ffd20fec81194f773d81b93ac601_1759222869.webp"

const MainSlider = () => {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <>
      <div className={style.mainSide}>
        <div className={style.mainSlider}>
          <Swiper
            dir="rtl"
            spaceBetween={30}
            centeredSlides={true}
            slidesPerView={1.4}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            // navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            loop={true}
            className={style.mySwiper}
          >
            <SwiperSlide className={style.SwiperSlide}>اسلایدر 1</SwiperSlide>
            <SwiperSlide className={style.SwiperSlide}>اسلایدر 2</SwiperSlide>
            <SwiperSlide className={style.SwiperSlide}>اسلایدر 3</SwiperSlide>
            <SwiperSlide className={style.SwiperSlide}>اسلایدر 4</SwiperSlide>
            <SwiperSlide className={style.SwiperSlide}>اسلایدر 5</SwiperSlide>
            

            <div className={style.AutoplayProgress} slot="container-end">
              <svg viewBox="0 0 48 48" ref={progressCircle}>
                <circle cx="24" cy="24" r="20"></circle>
              </svg>
              <span ref={progressContent}></span>
            </div>
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default MainSlider;
