import Card from 'react-bootstrap/Card';
import logo from '../../assets/templatr.png';
import { version as reactVersion } from 'react/package.json';
import { version as bootstrapVersion } from 'bootstrap/package.json';
import { version as typescriptVersion } from 'typescript/package.json';


const About = () => {

    // Runtime versions (app, node, electron, chrome) come from the main process;
    // build-time package versions are resolved from each dependency's manifest.
    const getVersions = () => {
        try {
            return window.electron.getVersions();
        }
        catch {
            return { app: '', node: '', electron: '', chrome: '' };
        }
    };

    const runtime = getVersions();

    const app = {
        version: runtime.app,
        node: runtime.node,
        electron: runtime.electron,
        react: reactVersion,
        typescript: typescriptVersion,
        bootstrap: bootstrapVersion,
        year: new Date().getFullYear(),
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
