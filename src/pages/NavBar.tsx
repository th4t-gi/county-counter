import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {

   const navigate = useNavigate()

   return (
      <nav className='flex px-8 py-2 justify-between flex-row'>

         <div className='flex flex-auto items-center'>
            test
         </div>

         <div className='flex flex-1/3 gap-x-8 justify-center grow items-center'>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
         </div>
         
         <div className='flex flex-1 justify-end gap-4'>
            <button className=' border border-gray-500 rounded p-2' onClick={() => navigate("/login")}>
               Login
            </button>
            <button className='border border-gray-500 rounded p-2'>
               <Link to="/register">Sign Up</Link>
            </button>
         </div>
      </nav>
   );
};

export default NavBar;