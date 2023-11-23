import React, { FC } from 'react';
import NavBar from './NavBar';


interface AboutProps {}

const About: FC<AboutProps> = () => (
  <div>
    <NavBar/>
    About Component
  </div>
);

export default About;
