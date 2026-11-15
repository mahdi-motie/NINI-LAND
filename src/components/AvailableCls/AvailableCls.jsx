import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

import style from "./AvailableCls.module.css";
import img1 from "../../assets/images/03918408403-e1.jpg";

const AvailableCls = () => {
  return (
    <>
      <div className={style.AvailableCls}>
        <div className={style.topSideTitle}>
          <p className={style.title}>
            Available <br /> Collection
          </p>

          <div className={style.sliderSide}>
            <a href="#">
              <div className={style.availableGrid}>
                <div className={style.topCardImage}>
                  <img src={img1} alt="" />
                  <div className={style.viewmore}>
                    <a href="#" className={style.ViewMoreLink}>
                      <button className={style.ViewmoreBtn}>View More</button>
                    </a>
                  </div>
                </div>
                <div className={style.bottomCardDetails}>
                  <div className={style.titlesCtg}>
                    <p className={style.cardTitle}>Pink Motcha</p>
                    <p className={style.cardCtg}>Geniuscat</p>
                  </div>
                  <p className={style.cardPrice} dir="rtl">
                    2,390,000تومان
                  </p>
                </div>
              </div>
            </a>
            <a href="#">
              <div className={style.availableGrid}>
                <div className={style.topCardImage}>
                  <img src={img1} alt="" />
                  <div className={style.viewmore}>
                    <a href="#" className={style.ViewMoreLink}>
                      <button className={style.ViewmoreBtn}>View More</button>
                    </a>
                  </div>
                </div>
                <div className={style.bottomCardDetails}>
                  <div className={style.titlesCtg}>
                    <p className={style.cardTitle}>Pink Motcha</p>
                    <p className={style.cardCtg}>Geniuscat</p>
                  </div>
                  <p className={style.cardPrice} dir="rtl">
                    2,390,000تومان
                  </p>
                </div>
              </div>
            </a>
            <a href="#">
              <div className={style.availableGrid}>
                <div className={style.topCardImage}>
                  <img src={img1} alt="" />
                  <div className={style.viewmore}>
                    <a href="#" className={style.ViewMoreLink}>
                      <button className={style.ViewmoreBtn}>View More</button>
                    </a>
                  </div>
                </div>
                <div className={style.bottomCardDetails}>
                  <div className={style.titlesCtg}>
                    <p className={style.cardTitle}>Pink Motcha</p>
                    <p className={style.cardCtg}>Geniuscat</p>
                  </div>
                  <p className={style.cardPrice} dir="rtl">
                    2,390,000تومان
                  </p>
                </div>
              </div>
            </a>
            <a href="#">
              <div className={style.availableGrid}>
                <div className={style.topCardImage}>
                  <img src={img1} alt="" />
                  <div className={style.viewmore}>
                    <a href="#" className={style.ViewMoreLink}>
                      <button className={style.ViewmoreBtn}>View More</button>
                    </a>
                  </div>
                </div>
                <div className={style.bottomCardDetails}>
                  <div className={style.titlesCtg}>
                    <p className={style.cardTitle}>Pink Motcha</p>
                    <p className={style.cardCtg}>Geniuscat</p>
                  </div>
                  <p className={style.cardPrice} dir="rtl">
                    2,390,000تومان
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailableCls;
