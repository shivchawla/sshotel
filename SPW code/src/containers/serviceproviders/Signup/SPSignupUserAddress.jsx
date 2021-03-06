/**
 * Copyright (C) NextGen Technology Solutions, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Hari <hari@ngstek.com>, Mar 2019
 */

import React from 'react'
import SPHeaderComponent from '../../../components/serviceproviders/HeaderCompnt/Header'
import FooterComponent from '../../../components/serviceproviders/FooterCompnt/Footer'
import SPSignupUserAddressComponent from '../../../components/serviceproviders/Signup/SPSignupUserAddressComponent'

class SPSignupUserAddress extends React.Component {

  render () {
    return (
      <div className='body-main'>
        {/* ------- Navbar --------- */}
        <SPHeaderComponent />
        <div className='main-content' id='panel'>
          {/* -------- Heaer ---------- */}
          <div className='header py-8 py-lg-7 pt-lg-9 home-header'>
            <div className='separator separator-bottom separator-skew zindex-100'>
              <svg x='0' y='0' viewBox='0 0 2560 100' preserveAspectRatio='none' version='1.1' xmlns='http://www.w3.org/2000/svg'>
                <polygon className='fill-default' points='2560 0 2560 100 0 100' />
              </svg>
            </div>
          </div>
          <SPSignupUserAddressComponent />
          <FooterComponent />
        </div>
      </div>
    )
  }
}

export default SPSignupUserAddress
