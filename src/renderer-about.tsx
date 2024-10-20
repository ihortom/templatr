import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createRoot } from 'react-dom/client';
import About from './components/About';


const root = createRoot(document.getElementById('about'));
root.render(<About />);