import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { read, update } from '../functions/product'

const FormEditProduct = () => {
    const params = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState({
        title: '',
        genre: '',
        duration: '',
        review: '',
        release_date: '',
        poster: ''
    })

    useEffect(() => {
        if (params.id) loadData(params.id)
    }, [params.id])

    const loadData = async (id) => {
        read(id)
            .then((res) => {
                const movie = res.data.movie || {}
                setData({
                    ...movie,
                    release_date: toYMD(movie.release_date), // <- สำคัญ
                })
            })
            .catch((err) => console.log(err))
    }

    const handleChange = (e) => {

        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            ...data,
            release_date: toYMD(data.release_date), // ensure YYYY-MM-DD
        }

        try {
            console.log('payload to update:', payload)
            const res = await update(params.id, payload)  // ใช้ await ให้แน่ใจว่าเรียกเสร็จจริง
            console.log('update result:', res?.data)
            // ถ้า backend คืน success=false หรือ error message จะเห็นใน log
            navigate('/')
        } catch (err) {
            console.error('update error:', err?.response?.data || err)
            alert('อัปเดตไม่สำเร็จ: ' + (err?.response?.data?.message || 'ดู console'))
        }
    }

    const toYMD = (val) => {
        if (!val) return ''
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val
        const d = new Date(val)
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        return local.toISOString().slice(0, 10)
    }



    return (
        <div>FormEditProduct

            <form onSubmit={handleSubmit}>
                <input type='text' name='title' onChange={e => handleChange(e)} placeholder='Title' value={data.title} />
                <input type='text' name='genre' onChange={e => handleChange(e)} placeholder='Genre' value={data.genre} />
                <input type='number' name='duration' onChange={e => handleChange(e)} placeholder='Duration' value={data.duration} />
                <input type='number' step='0.1' name='review' onChange={e => handleChange(e)} placeholder='Review' value={data.review} />
                <input type='date' name='release_date' onChange={e => handleChange(e)} placeholder='Release Date' value={data.release_date} />
                <input type='text' name='poster' onChange={e => handleChange(e)} placeholder='Poster URL' value={data.poster} />
                <button type='submit'>Update Movie</button>
            </form>
        </div>


    )
}

export default FormEditProduct