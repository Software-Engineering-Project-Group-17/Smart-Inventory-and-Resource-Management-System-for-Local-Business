import React from 'react'

const CustomizeProducts = () => {
  return (
    <div className='flex flex-col gap-6'>
        <h4 className='font-medium'>Choose a color</h4>
        <ul className='flex items-center gap-3'>
            <li className='w-8 h-8 rounded-full bg-red-500 ring-1 ring-gray-300 relative cursor-pointer'>
                <div className='absolute w-10 h-10 rounded-full ring-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'></div>
            </li>
            <li className='w-8 h-8 rounded-full bg-blue-500 ring-1 ring-gray-300 relative cursor-pointer'></li>
            <li className='w-8 h-8 rounded-full bg-green-500 ring-1 ring-gray-300 relative cursor-not-allowed '>
                <div className='absolute w-10 h-[2px] bg-red-500 rotate-45 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'></div>
            </li>
        </ul>

 
        <h4 className='font-medium'>Choose a size</h4>
        <ul className='flex items-center gap-3'>
            <li className='ring-1 ring-lama text-lama rounded-md px-4 py-1 cursor-pointer'>Small</li>
            <li className='ring-1 ring-lama bg-lama text-white rounded-md px-4 py-1 cursor-pointer'>Medium</li>
            <li className='ring-1 ring-pink-200 text-white bg-pink-200 rounded-md px-4 py-1 cursor-not-allowed'>Large</li>

        </ul>

    </div>
  )
}

export default CustomizeProducts