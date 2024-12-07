export function ErrorInfo({ error }) {
    return <div style={{ color: 'red' }}>
        {error.toString()}
        </div>
}