import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false)
    const Navigate = useNavigate();
    const Location = useLocation();

    // Get the previous location or set a default route
    const from = Location.state?.from?.pathname || '/';

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation 
        if(!email || !password){
            setError('Please fill in all fields');
            return;
        }

        //simulate login
        // replace this part with actual login e.g API call
        if(email === 'text@example.com' && password === 'password'){
            //Redirect to the home page after successful login
            Navigate(from);
        }else{
            setError('Invalid email or password');
        }
    }

    return(
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white p-6 rounded-lg shadow-md w-80'>
                <h2 className='text-xl font-bold mb-4 text-center'>
                    Login
                </h2>
                {error && <p className='text-red-500 mb-4'>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label htmlFor="email" className='block text-sm mb-1'>Email</label>
                        <input 
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600'
                            placeholder='Enter Your Email'
                        />
                    </div>
                    <div className='mb-0'>
                        <label htmlFor="password" className='block text-sm mb-1'>Password</label>
                        <div className='relative'>
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600'
                            placeholder='Enter Your Password'
                        />
                        <button 
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}    
                            className='absolute right-2 top-2 text-gray-400'
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                        </div>
                    </div>
                    <p className='text-end'>
                        <a href="/forgot-password" className='text-blue-600 text-sm'>Forgot password?</a>
                    </p>
                    <button 
                        type='submit'
                        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4'
                    >
                        Login
                    </button>
                </form>
                <p className='mt-2 text-center text-sm'>
                    Don't have an account? <a href="/register" className='text-blue-600'>Sign up</a>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;