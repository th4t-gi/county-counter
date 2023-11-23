import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';


interface Page404Props {}

const Page404: FC<Page404Props> = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button className="border border-gray-500 rounded p-2" onClick={() => navigate(-1)}>
        Go Back
      </button>

      Page404 Component
    </div>
  )
};

export default Page404;
