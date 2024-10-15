import React, { useState } from 'react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulate sending a password reset email
        if(email){
            setMessage(`Password reset link sent to ${email}`);
            // Here you would call your API to send the email
        }else{
            setMessage('Please enter your email');
        }
    }

    return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white p-6 rounded-lg shadow-md w-80'>
                <h2 className='text-xl font-bold mb-4 text-center'>Forgot Password</h2>
                {message && <p className='text-green-500 mb-4'>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label htmlFor="email" className='block text-sm mb-1'>Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600'
                            placeholder='Enter Your Email'
                        />
                    </div>
                    <button
                        type='submit'
                        className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'
                    >Send Reset Link</button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPasswordPage;