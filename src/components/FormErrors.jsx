export const FormErrors = ({ errors }) => {
    const messages = [...new Set(Object.values(errors).filter(Boolean))];
    if (messages.length === 0) return null;

    return (
        <div className="text-danger mb-3" role="alert">
            {messages.map(message => <p key={message}>{message}</p>)}
        </div>
    );
};
