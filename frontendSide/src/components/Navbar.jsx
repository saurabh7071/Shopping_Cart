import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
    return (
        <div className='bg-blue-600 p-4'>
            <div className='container mx-auto flex justify-between items-center'>
                {/* <Link to="/">Shop<span className='text-cyan-200'>Cart</span></Link> */}
                <Link to="/">
                    <img src="/logo.png" alt="ShopCart logo" className='h-10 rounded-lg' />
                </Link>

                {/* Cart & Authentication Buttons */}
                <div className='flex items-center space-x-6'>
                    {/* Links */}
                    <ul className='flex space-x-4'>
                        <li>
                            <Link to="/" className='text-white hover:text-teal-300'>Home</Link>
                        </li>
                        <li>
                            <Link to="/products" className="text-white hover:text-teal-300">Products</Link>
                        </li>
                    </ul>
                    <Link to="/cart" className='text-white hover:text-teal-300'>
                        <FontAwesomeIcon icon={faShoppingCart} size='lg' />
                    </Link>
                    <Link to="/login" className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-700">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Navbar;