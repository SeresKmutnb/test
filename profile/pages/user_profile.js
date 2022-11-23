
import React, { useState, useEffect } from "react";
import Modal from "../styles/Modal.module.css";
import { AiFillEdit } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import axios from 'axios'
import { FaPlus } from "react-icons/fa";
import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"
import styles from "../styles/picupload.module.css"
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function User() {
  const [data, setData] = useState({
    id: '',
    displayName: '',
    img: '',
    Tel: '',
    email: '',
    Live: [{}],
  })
  const [showModal, setShowModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImgModal, setShowImgModal] = useState(false);
  const [index, setindex] = useState('');
  const [file, setFile] = useState() // เก็บรูป

  async function onClickUpload() {
    const i = data.id
    const imgName = Date.now() + '-' + file.name.replaceAll(' ', '-') // ชื่อไฟล์
    const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/tar/users/' + imgName    // ไว้เก็บบน MongoDB
    const parallelUploads3 = new Upload({
      client: new S3Client({
        region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY
        }
      }),
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
        Key: 'tar/users/' + imgName,
        Body: file
      },
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    })
    await parallelUploads3.done()

    await axios.post('http://localhost:8000/users/update/img', { imgURL, i })
    .then(result => {
      console.log(result.data)
      toast.success('🦄 ADD SUCCESS!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })

  }

  useEffect(() => {
    axios.get('http://localhost:8000/api/user/get')
      .then(result => {
        setData({
          id: result.data._id,
          displayName: result.data.userData.displayName,
          img: result.data.userData.img,
          Tel: result.data.userData.tel,
          email: result.data.email,
          Live: result.data.userData.address,
        })
      })
  })

  return (
    <div className='screen' >
      <ToastContainer />
      <title>profile</title>
      <center><h1>จัดการบัญชี</h1></center>
      <div className='container'>
        <div className='profile_header'>
          <div className='images_profile'>
            <label for="avatar" style={{cursor:'pointer'}}><img src={data.img} className='profile_img' alt={data.displayName} /></label>
          </div>
          
          <div className='profile_name'>
            Name: {data.displayName}<br />
            Tel: {data.Tel}<br />
            Email: {data.email}<br />
            {/* <label style={{color:'red',cursor:'pointer'}} >เปลี่ยนรหัสผ่าน</label> <br /> */}
            <br />
          </div>
          <button className='edit' onClick={() => setShowModal(true)}>
            แก้ไขข้อมูลส่วนตัว
          </button>
          <input style={{display:'none'}} onClick={() => setShowImgModal(true)} id="avatar" name="avatar"></input>
          
        </div>
        <br /><hr /><br />
        <div className='profile_content'>
          <div className='live'>
            ข้อมูลที่จัดส่ง
          </div>
        </div><br />
        {data.Live.map((addr, x) => (
          <div className="profile_content" key={`address-${x}`}>
            ชื่อที่อยู่จัดส่ง: {addr.Name} <br />
            ข้อมูลที่อยู่จัดส่ง: {addr.address} &nbsp; {addr.subdistrict} &nbsp; {addr.district} &nbsp; {addr.province} &nbsp; {addr.zipCode} &nbsp; {addr.country} &nbsp; 
            <button className='liveEdit' onClick={() => (setShowLiveModal(true), setindex(x))}><AiFillEdit /></button>
            <button className='liveDelete' onClick={() => (onClickDeleteAddress(x))}><ImBin /></button>
            <br /><br /><br />
          </div>
        ))}
      </div>
      <br />
      <br />
      <center><button className='liveAdd' onClick={() => (setShowAddModal(true))}><FaPlus /></button></center>
      {
        showModal ? (
          <div className='screen'>
            <div className={Modal.overlay}>
              <div className={Modal.modal}>
                <div className={Modal.box}>
                  <div className={Modal.header}>
                    <a onClick={() => setShowModal(false)}>
                      <button className={Modal.edit_close} >Close</button>
                    </a>

                  </div>
                  <div className={Modal.body}>
                    <form >
                      <label>Name : </label><input placeholder={data.displayName} type='text' id="user" className={Modal.Name} ></input><br />
                      <label>Phone : </label><input placeholder={data.Tel} type='tel' name="tele" id="tele" maxLength='10' className={Modal.Phone}></input><br />
                      <label>Email : </label><input placeholder={data.email} type='email' name="mail" id="mail" className={Modal.Email}></input>
                      <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '75%' }} type="button" onClick={() => (onClickedit(user.value, tele.value, mail.value), setShowModal(false))} value="Save"></input><br />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null
      },
      {
        showLiveModal && index !== '' ? (
          <div className='screen'>
            <div className={Modal.overlay}>
              <div className={Modal.modal}>
                <div className={Modal.box}>
                  <div className={Modal.header}>
                    <a onClick={() => (setShowLiveModal(false), setindex(''))}>
                      <button className={Modal.edit_close} >Close</button>
                    </a>
                  </div>
                  <div className={Modal.body}>
                    <form style={{width:'250px',marginLeft:'20px'}}>
                      <label>ชื่อที่อยู่จัดส่ง : </label><input placeholder={data.Live[index].Name} type='text' id="liv" name="liv" className={Modal.Name}></input><br />
                      <label>บ้านเลขที่ : </label><br /><input placeholder={data.Live[index].address} name="addr" id="addr" className={Modal.Name}></input><br />
                      <label>แขวง / ตำบล  : </label><br /><input placeholder={data.Live[index].subdistrict} name="subd" id="subd" className={Modal.Name}></input><br />
                      <label>เขต / อำเภอ   : </label><br /><input placeholder={data.Live[index].district} name="dist" id="dist" className={Modal.Name}></input><br />
                      <label>จังหวัด  : </label><br /><input placeholder={data.Live[index].province} name="prov" id="prov" className={Modal.Name}></input><br />
                      <label>รหัสไปรษณีย์   : </label><br /><input placeholder={data.Live[index].zipCode} name="zipC" id="zipC" className={Modal.Name}></input><br />
                      <label>ประเทศ  : </label><br /><input placeholder={data.Live[index].country} name="coun" id="coun" className={Modal.Name}></input><br />
                      <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '68%' }} type="button" onClick={() => (onClickeditLive(liv.value, addr.value, index, subd.value, dist.value, prov.value, zipC.value, coun.value), setShowLiveModal(false), setindex(''))} value="Save"></input><br />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null
      },
      {
        showAddModal ? (
          <div className='screen'>
            <div className={Modal.overlay}>
              <div className={Modal.modal}>
                <div className={Modal.box}>
                  <div className={Modal.header}>
                    <a onClick={() => (setShowAddModal(false))}>
                      <button className={Modal.edit_close} >Close</button>
                    </a>
                  </div>
                  <div className={Modal.body}>
                    <form style={{width:'250px',marginLeft:'20px'}}>
                      <label>ชื่อที่อยู่จัดส่ง : </label><input  type='text' id="liv" name="liv" className={Modal.Name}></input><br />
                      <label>บ้านเลขที่ : </label><br /><input name="addr" id="addr" className={Modal.Name}></input><br />
                      <label>แขวง / ตำบล  : </label><br /><input name="subd" id="subd" className={Modal.Name}></input><br />
                      <label>เขต / อำเภอ   : </label><br /><input name="dist" id="dist" className={Modal.Name}></input><br />
                      <label>จังหวัด  : </label><br /><input name="prov" id="prov" className={Modal.Name}></input><br />
                      <label>รหัสไปรษณีย์   : </label><br /><input name="zipC" id="zipC" className={Modal.Name}></input><br />
                      <label>ประเทศ  : </label><br /><input name="coun" id="coun" className={Modal.Name}></input><br />
                      <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '68%' }} type="button" onClick={() => (onClickAddLive(liv.value, addr.value, subd.value, dist.value, prov.value, zipC.value, coun.value), setShowAddModal(false))} value="Save"></input><br />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null
      },
      {
        showImgModal ? (
          <div className='screen'>
            <div className={Modal.overlay}>
              <div className={Modal.modal}>
                <div className={Modal.box}>
                  <div className={Modal.header}>
                    <a onClick={() => (setShowImgModal(false))}>
                      <button className={Modal.edit_close} >Close</button>
                    </a>
                  </div>
                  <div className={Modal.body}>
                    <div className={styles.fileDropArea}>
                      <div className={styles.imagesPreview} id='containerPreviewImg'>
                        {file && <img src={URL.createObjectURL(file)} id='pre-img' />}
                      </div>
                      <input className={styles.inputField} type="file" name='filename' id="filename" onChange={e => setFile(e.target.files[0])} accept="image/png, image/jpeg, image/jpg, image/gif"/>
                      <div className={styles.fakeBtn}>Choose files</div>
                      <div className={styles.msg}>or drag and drop files here</div><br />
                    </div>
                  </div>
                  <br/>
                  <input className={Modal.edit_close} style={{ marginLeft:'75%' }} type="button" onClick={() => {onClickUpload();setShowImgModal(false)}} value="Save"></input>
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
    </div>
  )
  async function onClickedit(u, t, e) {
    /*set State และ update ค่าใน database*/
    if (u === '') u = data.displayName
    if (t === '') t = data.Tel
    if (e === '') e = data.email
    const i = data.id
    await axios.post('http://localhost:8000/users/update/users', { u, t, e, i })
    .then(result => {
      console.log(result.data)
      toast.success('🦄 Your profile has been updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
  }
  async function onClickeditLive(a, l, index, subd, dist, prov, zipC, coun) {
    /*set State และ update ค่าใน database*/
    if (a === '') a = data.Live[index].Name
    if (l === '') l = data.Live[index].address
    if (subd === '') subd = data.Live[index].subdistrict
    if (dist === '') dist = data.Live[index].district
    if (prov === '') prov = data.Live[index].province
    if (zipC === '') zipC = data.Live[index].zipCode
    if (coun === '') coun = data.Live[index].country
    const i = data.id
    await axios.post('http://localhost:8000/users/update/live', { a, l, index, i, subd, dist, prov, zipC, coun })
    .then(result => {
      console.log(result.data)
      toast.success('🦄 Your address is updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
  }
  async function onClickDeleteAddress(index) {
    const i = data.id
    await axios.post('http://localhost:8000/users/delete/live', { index, i })
    .then(result => {
      console.log(result.data)
      toast.success('🦄 Your address is updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
  }
  async function onClickAddLive(a, l, subd, dist, prov, zipC, coun) {
    if (a === '' || l === '' || subd === '' || dist === '' || prov === '' || zipC === '' || coun === '' ) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter all information'
      })
      return
    } 
    const i = data.id
    await axios.post('http://localhost:8000/users/add/live', { a, l, i, subd, dist, prov, zipC, coun })
    .then(result => {
      console.log(result.data)
      toast.success('🦄 ADD SUCCESS!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
  }
  
}


