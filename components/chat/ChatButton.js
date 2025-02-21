const ChatButton = () => {
    return (
      <button
        onClick={() => window.open('https://chat.mtktechlab.com/livechat', '_blank')}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#1d74f5",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Chat with Support
      </button>
    );
  };

  export default ChatButton;
