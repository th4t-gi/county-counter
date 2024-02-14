import React, { FC } from 'react';
import NavBar from '../components/NavBar';


interface AboutProps { }

const About: FC<AboutProps> = () => (
  <div>
    <NavBar />
    About Component
  </div>
);

export default About;
