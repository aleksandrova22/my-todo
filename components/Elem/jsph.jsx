export const config = {
        columns: [
        { title: 'id', content: todo => todo.id },
        { title: 'checked', content: todo => todo.checked },
        { title: 'text', getVal: ({ text }) => text, setVal: text => ({ text }) }
        
     
    ]
};