import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { remove, create, getdata } from '../functions/product'

const FormProduct = () => {
    // javascript
    const [products, setProducts] = useState([])
    const [movies, setMovies] = useState({})

    useEffect(() => {
        // code
        loadData()

    }, [])

    const loadData = async () => {
        getdata()
            .then((res) => setProducts(res.data.movies))
            .catch((err) => console.log(err))
    }

    const handleChange = (e) => {

        setMovies({
            ...movies,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        create(movies)
            .then((res) => {
                loadData()
            })
            .catch((err) => console.log(err))
    }

    const handleRemove = async (id) => {
        remove(id)
            .then((res) => {
                loadData()
            })
            .catch((err) => console.log(err))
    }

    return (
        <div>

            <form onSubmit={handleSubmit}>
                <input type='text' name='title' onChange={e => handleChange(e)} placeholder='Title' />
                <input type='text' name='genre' onChange={e => handleChange(e)} placeholder='Genre' />
                <input type='number' name='duration' onChange={e => handleChange(e)} placeholder='Duration' />
                <input type='number' step='0.1' name='review' onChange={e => handleChange(e)} placeholder='Review' />
                <input type='date' name='release_date' onChange={e => handleChange(e)} placeholder='Release Date' />
                <input type='text' name='poster' onChange={e => handleChange(e)} placeholder='Poster URL' />
                <button type='submit'>Add Movie</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Genre</th>
                        <th>Duration</th>
                        <th>Review</th>
                        <th>Release Date</th>
                        <th>Poster</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products ? products.map((item, index) =>
                            <tr key={index}>
                                <td>{item.title}</td>
                                <td>{item.genre}</td>
                                <td>{item.duration}</td>
                                <td>{item.review}</td>
                                <td>{item.release_date
                                    ? new Date(item.release_date).toLocaleDateString('th-TH')
                                    : '' }
                                </td>
                                <td><img src={item.poster} alt={item.title} width="50" /></td>
                                <td>
                                    <button>
                                        <Link to={'/edit/' + item.movie_id}>
                                            Edit
                                        </Link>
                                    </button>
                                    <button onClick={() => handleRemove(item.movie_id)}>Delete</button>
                                </td>
                            </tr>
                        )
                            : null
                    }
                </tbody>
            </table>

        </div>
    )
}

export default FormProduct