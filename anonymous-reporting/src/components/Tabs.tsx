interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'report', label: 'Submit Report' },
    { id: 'track', label: 'Track Progress' },
    { id: 'investigate', label: 'Investigation Management' },
    { id: 'stats', label: 'Statistics' },
  ];

  return (
    <div className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
