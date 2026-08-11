import React from 'react';
import { FileSignature } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Logo = () => {
    return (
        <> 
        <NavLink to="/" >
        <div className='flex gap-2 justify-center items-center'>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <div className='flex flex-col'>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                  NeXsign
              </span>
               <span className='text-[10px] text-right text-sky-600'>by Fixensy</span>
            </div>
            
            </div>
            </NavLink>
        </>
    );
};

export default Logo;