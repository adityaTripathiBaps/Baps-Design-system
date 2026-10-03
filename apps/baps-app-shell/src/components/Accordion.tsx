import React from 'react';
import './Accordion.css';

export const Accordion: React.FC = () => <div className="baps-accordion"><div className="baps-accordion-item"><button className="baps-accordion-header"><span className="baps-accordion-title">Section</span><span className="baps-accordion-icon"></span></button><div className="baps-accordion-content"><p>Content</p></div></div></div>;