import Card from 'react-bootstrap/Card';
import logo from '../../assets/templatr.png';


const About = () => {

    const app = {
        version: "2.0.0",
        node: "20.14.0",
        electron: "31.1.0",
        react: "18.3.1",
        typescript: "4.5.4",
        bootstrap: "5.3.3",
        year: 2024,
    };

    return (       
        <Card className="info smaller">
            <Card.Header as="h6">
                <img src={logo} alt="Templatr logo" />
                <p className='title'>Templatr</p>
                <p className="text-muted">Version {app.version}</p>
                <p className="card-text">
                    Templatr is a generic templating application for a quick copy & paste action 
                    with easy to search templates maintained in YAML format and with support for comments.
                </p>
            </Card.Header>
            <Card.Body>
                <p>Built with Electron framework and powered by React, TypeScript, and Bootstrap.</p>
                <p>
                    Used modules are node {app.node},<br />
                    Electron {app.electron},<br />
                    React {app.react},<br />
                    TypeScript {app.typescript},<br />
                    and Bootstrap {app.bootstrap}.
                </p>
            </Card.Body>
            <Card.Footer className="text-muted smaller">
                Copyright © {app.year} Ihor Tomilenko
            </Card.Footer>
        </Card>
    );
};

export default About;
