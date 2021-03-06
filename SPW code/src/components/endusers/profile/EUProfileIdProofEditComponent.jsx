/**
 * Copyright (C) NextGen Technology Solutions, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Hari <hari@ngstek.com>, Mar 2019
 */

import React from 'react'
import { t } from 'ttag'
import { hashHistory } from 'react-router'
import { fetch as fetchPolyfill } from 'whatwg-fetch'
import config from '../../../../public/config.json'
import APICallManager from '../../../services/callmanager'
import EUProfileSideMenu from './EUProfileSideMenu'
import Modal from 'react-modal'
import { ToastsContainer, ToastsStore, ToastsContainerPosition } from 'react-toasts'
import './css/Profile.css'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

class EUProfileIdProofEditComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      authObj: JSON.parse(localStorage.getItem('authObj')),
      idTypeValid: true,
      reload: false,
      idProofData: {},
      oldIDProofData: {},
      filename: '',
      file: [],
      imgsrc: [],
      dobOnId: '',
      _id: '',
      idNumber: '',
      nameOnId: '',
      idStatus: 'Not-Verified',
      modalIsOpen: false,
      showData: {},
      submitDisabled: false,
      errorMessage: '',
      isVoterIdUpDated: false,
      isDrivingLicenceUpDated: false
    }
    this.handleBack = this.handleBack.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.handleUpdateIdProof = this.handleUpdateIdProof.bind(this)
    this.handleIdTypeValidation = this.handleIdTypeValidation.bind(this)
    this.handleApiCall = this.handleApiCall.bind(this)
    this.handleViewIdProof = this.handleViewIdProof.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentWillMount () {
    let data = JSON.parse(localStorage.getItem('idProofData'))
    this.setState({
      idProofData: data,
      oldIDProofData: data,
      _id: data._id,
      dobOnId: data.dobOnId
    })
  }
  handleBack (e) {
    hashHistory.push('/idproofs')
    event.preventDefault()
  }
  handleViewIdProof (idProofData) {
    this.setState({ modalIsOpen: true, showData: idProofData })
    event.preventDefault()
  }

  handleOk () {
    this.setState({ modalIsOpen: false, showData: {} })
  }
  closeModal () {
    this.setState({ modalIsOpen: false, showData: {} })
  }
  onFileChange (e) {
    this.setState({ file: e.target.files[0], filename:e.target.files[0].name })
    var file = e.target.files[0]
    var fileType = file.type ? file.type.split('/')[0] : ''
    if (fileType !== 'image') {
      this.setState({ errorMessage: t`lanEULabelErrorUploadValidImage` })
    } else {
      var reader = new FileReader()
      var url = reader.readAsDataURL(file)
      reader.onloadend = function (e) {
        this.setState({
          imgsrc: [reader.result], errorMessage: ''
        })
      }.bind(this)
      console.log(url)
    }
  }
  handleIdTypeValidation (event) {
    let idType = event.target.value
    this.setState(prevState => {
      let idProofData = Object.assign({}, prevState.idProofData)
      let errorMessage = ''
      idProofData.idType = idType
      return { idProofData, errorMessage }
    })
    let userObj = {
      unBlockStatus: true,
      url: config.baseUrl + config.getEUProfileIdTypeValidateAPI + idType
    }
    let _this = this
    APICallManager.getCall(userObj, function (resObj) {
      if (resObj.data.statusCode === '0000') {
        _this.setState({ idTypeValid: false, errorMessage: t`lanEULabelErrorIdTypeMessage` })
      } else {
        _this.setState({ idTypeValid: true, errorMessage: '' })
      }
    })
  }
  handleUpdateIdProof () {
    let oIDpd = this.state.oldIDProofData
    let idPD = this.state.idProofData
    let DOBRegx = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
    if (!this.state.idTypeValid) {
      this.setState({ errorMessage: t`lanEULabelErrorIdTypeMessage` })
    } else if (this.state.idProofData.idType === 'Driving License' && !this.state.dobOnId.trim()) {
      this.setState({ errorMessage: t`lanEULabelErrorDateOfBirthIsRequired` })
    } else if (this.state.idProofData.idType === 'Driving License' && !DOBRegx.test(this.state.dobOnId)) {
      this.setState({ errorMessage: t`lanSPLabelErrorPleaseEnterDOBInFormatDDMMYYYY` })
    } else if (!idPD.idNumber.trim()) {
      this.setState({ errorMessage: t`lanEULabelErrorCardNumberRequired` })
    } else if (!idPD.nameOnId.trim()) {
      this.setState({ errorMessage: t`lanEULabelErrorNameOnIdRequired` })
    } else {
      var isUpdate = JSON.stringify(oIDpd) === JSON.stringify(idPD)
      if (isUpdate && !this.state.filename && this.state.idProofData.dobOnId === this.state.dobOnId) {
        hashHistory.push('/idproofs')
      } else {
        if (this.state.idProofData.idType === 'Voter Card') {
          if (this.state.idProofData.idNumber !== this.state.oldIDProofData.idNumber) {
            this.handleUpdateApiCall()
          } else {
            this.handleApiCall()
          }
        } else {
          if (this.state.idProofData.idNumber !== this.state.oldIDProofData.idNumber || this.state.idProofData.dobOnId !== this.state.dobOnId) {
            this.handleUpdateApiCall()
          } else {
            this.handleApiCall()
          }
        }
      }
    }
    event.preventDefault()
  }
  handleApiCall () {
    this.setState({ submitDisabled: true })
    let _this = this
    const data = new FormData()
    data.append('profileIdProofImage', this.state.file)
    data.append('idType', this.state.idProofData.idType)
    data.append('idNumber', this.state.idProofData.idNumber)
    data.append('nameOnId', this.state.idProofData.nameOnId)
    data.append('dobOnId', this.state.idProofData.dobOnId)
    data.append('validateAdhaarApi', false)
    fetchPolyfill(config.baseUrl + config.putEUProfileIdProofUpdateAPI + this.state._id, {
      method: 'PUT',
      body: data,
      headers: { 'token': localStorage.getItem('token') }
    }).then((response) => {
      _this.setState({ submitDisabled: false })
      response.json().then((resData) => {
        if (resData.statusCode === '0000') {
          ToastsStore.success(t`lanEULabelErrorIDProofUpdatedSuccessfully`)
          setTimeout(() => {
            hashHistory.push('/idproofs')
          }, 2000)
        } else if (resData.statusCode === '9980') {
          ToastsStore.error(t`lanEULabelErrorInvalidIDProofDetails`)
        } else {
          ToastsStore.error(t`lanEULabelErrorIDProofUpdateFailed`)
        }
      })
    })
  }

  handleUpdateApiCall () {
    this.setState({ submitDisabled: true })
    let _this = this
    const data = new FormData()
    data.append('profileIdProofImage', this.state.file)
    data.append('idType', this.state.idProofData.idType)
    data.append('idNumber', this.state.idProofData.idNumber)
    data.append('nameOnId', this.state.idProofData.nameOnId)
    data.append('dobOnId', this.state.dobOnId)
    data.append('validateAdhaarApi', true)
    fetchPolyfill(config.baseUrl + config.putEUProfileIdProofUpdateAPI + this.state._id, {
      method: 'PUT',
      body: data,
      headers: { 'token': localStorage.getItem('token') }
    }).then((response) => {
      _this.setState({ submitDisabled: false })
      response.json().then((resData) => {
        if (resData.statusCode === '0000') {
          ToastsStore.success(t`lanEULabelErrorIDProofUpdatedSuccessfully`)
          setTimeout(() => {
            hashHistory.push('/idproofs')
          }, 2000)
        } else if (resData.statusCode === '9980') {
          ToastsStore.error(t`lanEULabelErrorInvalidIDProofDetails`)
        } else {
          ToastsStore.error(t`lanEULabelErrorIDProofUpdateFailed`)
        }
      })
    })
  }
  render () {
    return (
      <div className='main-content' id='panel'>
        {/* ------- Navbar --------- */}
        <div className='container-fluid mt-5 pb-5'>
          <div className='row'>
            <div className='col-lg-3' >
              <EUProfileSideMenu authObj={this.state.authObj} />
            </div>
            <div className='col-lg-9' >
              <div className='edit-profile-info id-proof-edit'>
                <div className='card'>
                  <div className='card-header card-header-danger'>
                    <h4 className='card-title'>{ t`lanEUTitleUpdateIDProof` }</h4>
                  </div>
                  <div className='edit-profile-form'>
                    <div className='card-body'>
                      <div className='row'>
                        <div className='col-md-6'>
                          <div className='form-group'>
                            <label className='form-control-label' >{ t`lanCommonLabelIDType` } <span className='error'>*</span></label>
                            <select className='form-control' disabled value={(this.state.idProofData && this.state.idProofData.idType) ? this.state.idProofData.idType : ''} onChange={this.handleIdTypeValidation} >
                              {(this.state.idProofData && this.state.idProofData.idType)
                              ? null : <option value=''>{ t`lanEULabelPleaseSelectIdType` }</option>}
                              <option value='Aadhar Card'>Aadhar Card</option>
                              <option value='Voter Card'>Voter Card</option>
                              <option value='Passport'>Passport</option>
                              <option value='Ration Card'>Ration Card</option>
                              <option value='PAN Card'>PAN Card</option>
                              <option value='Driving License'>Driving License</option>
                            </select>
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className='form-group'>
                            <label>{ t`lanCommonLabelCardNumber` } <span className='error'>*</span></label>
                            <input type='text' className='form-control' maxLength='20' value={(this.state.idProofData && this.state.idProofData.idNumber) ? this.state.idProofData.idNumber : ''}
                              onChange={
                              () =>
                                this.setState(prevState => {
                                  let idProofData = Object.assign({}, prevState.idProofData)
                                  let errorMessage = ''
                                  idProofData.idNumber = event.target.value
                                  return { idProofData, errorMessage }
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className='row'>
                        <div className='col-md-6'>
                          <div className='form-group'>
                            <label>{ t`lanCommonLabelNameonID` } <span className='error'>*</span></label>
                            <input type='text' className='form-control' maxLength='40' value={this.state.idProofData.nameOnId}
                              onChange={
                              () =>
                                this.setState(prevState => {
                                  let idProofData = Object.assign({}, prevState.idProofData)
                                  let errorMessage = ''
                                  idProofData.nameOnId = event.target.value
                                  return { idProofData, errorMessage }
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className='form-group'>
                            <div className='row '>
                              <label className='form-control-label col-sm-10'>{ t`lanCommonLabelChooseIDProof` } <span className='error'>*</span></label>
                              <a onClick={() => this.handleViewIdProof(this.state.idProofData)} className='table-action table-action-view text-right' data-toggle='tooltip' title='IdProofView'>
                                <i className='far fa-eye' />
                              </a>
                            </div>
                            <div className='custom-file '>
                              <input type='file' className='custom-file-input' name='file' onChange={this.onFileChange} />
                              <label className='custom-file-label'>{this.state.filename ? this.state.filename : (this.state.idProofData.kycImageOriginalName
                              ? this.state.idProofData.kycImageOriginalName : 'Choose ID Proof')}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='row'>
                        {this.state.idProofData.idType === 'Driving License'
                        ? <div className='col-md-6'>
                          <div className='form-group'>
                            <label>{ t`lanCommonLabelDateOfBirth` }<span className='error'>*</span></label>
                            <input type='text' className='form-control' onChange={(e) => this.setState({ dobOnId: e.target.value, errorMessage: '' })} value={this.state.dobOnId} />
                          </div>
                        </div>
                        : null }
                        <div className='col-md-6'>
                          <div className='form-group'>
                            <label>{ t`lanCommonLabelStatus` }<span className='error'>*</span></label>
                            <input type='text' className='form-control' value={this.state.idStatus} disabled />
                          </div>
                        </div>
                      </div>
                      <div className='row'>
                        <div className='container'>
                          <label className='label-control' style={{ color: 'red' }}>{this.state.errorMessage}</label>
                        </div>
                      </div>
                      <div className=' row'>
                        <div className='col-sm-12 text-right' >
                          {!this.state.submitDisabled
                        ? <button onClick={this.handleUpdateIdProof} className='btn btn-primary mr-3' >{ t`lanCommonButtonUpdate` }</button>
                        : <button disabled className='btn btn-primary mr-3' >{ t`lanCommonButtonUpdate` }</button> }
                          <button onClick={this.handleBack} className='btn btn-danger' >{ t`lanCommonButtonBack` }</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_CENTER} />
        <Modal ariaHideApp={false} isOpen={this.state.modalIsOpen} style={customStyles} >
          <div className='container'>
            <div className='row justify-content-center'>
              <div className='col-sm-12 text-right'>
                <a onClick={this.closeModal} ><i className='fas fa-times text-danger' style={{ fontSize: 22 }} /></a>
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-5'>
                <div className='form-group'>
                  <label className='col-sm-3 text-grey'>{ t`lanCommonLabelIDType` }:</label>
                  <b className='col-sm-9 text-black' style={{ fontSize: 14 }}>{this.state.showData.idType}</b>
                </div>
              </div>
              <div className='col-sm-7'>
                <div className='form-group'>
                  <label className='col-sm-4 text-grey'>{ t`lanCommonLabelCardNumber` }:</label>
                  <b className='col-sm-8 text-black' style={{ fontSize: 14 }} >{this.state.showData.idNumber}</b>
                </div>
              </div>
            </div>
            <div className='row mb-3'>
              <div className='col-sm-12 text-center'>
                <div className='id-proof-img-modal-div'>
                  <img src={this.state.showData.kycImagePath ? config.baseUrl + this.state.showData.kycImagePath : ''} className='rounded' height='400' />
                </div>
              </div>
            </div>
            <div className='row '>
              <div className='col-sm-12 text-right mb-3'>
                <button className='btn btn-danger' onClick={this.closeModal}>{ t`lanEUButtonCloseClose` }</button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default EUProfileIdProofEditComponent
