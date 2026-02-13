import TopNav from './components/TopNav/TopNav';
import Sidebar from './components/Sidebar/Sidebar';
import ChatPanel from './components/ChatPanel/ChatPanel';
import LivePreview from './components/LivePreview/LivePreview';
import SvgGradients from './components/shared/SvgGradients';

export default function App() {
  return (
    <div className="app">
      <TopNav />
      <div className="main">
        <Sidebar />
        <ChatPanel />
        <LivePreview />
      </div>
      <SvgGradients />
    </div>
  );
}
