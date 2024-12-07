import useSWR from 'swr';
import toast from 'react-hot-toast';
import { ErrorInfo } from '../components/Error';
import { config } from './Elem/jsph';
import { useState } from 'react';
import { List } from './Elem/List';
import { Button } from './Elem/Button';


const
    API_URL = '/api/todo',
    DELETE = 'del',
    ADD = 'add',
    START_EDIT = 'start_edit',
    EDIT = 'edit',
    CANCEL_EDIT = 'cancel_edit',

    fetcher = async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('fetch ' + response.status);
        return await response.json();
    },
    infoFetcher = async () => {
        const pr = fetcher();
        toast.promise(pr, {
            loading: 'Fetcher ',
            success: 'ok',
            error: (err) => `${err.toString()}`,
        });
        return await pr;
    }


function DataForm({ columns, values, setValues, children }) {
    return <li>
        {columns.map(({ setVal }, i) => <span key={i}>
            {setVal
                ? <input
                    value={values[i]}
                    onInput={event => setValues(prev => prev.with(i, event.target.value))} />
                : ''}
        </span>)}
        <hr />
        <span>
            {children}
        </span>
    </li>;

}


export function ToDo() {
    const
        { data, error, isLoading, isValidating, mutate } = useSWR(API_URL, infoFetcher, { revalidateOnFocus: false }),
        [addFormValues, setAddFormValues] = useState(Array.from({ length: config.columns.length }, () => '')),
        [editFormValues, setEditFormValues] = useState(Array.from({ length: config.columns.length }, () => '')),
        [editedId, setEditedId] = useState(null),

        onClick = async event => {
            const
                action = event.target.closest('[data-action]')?.dataset?.action,
                id = event.target.closest('[data-id]')?.dataset?.id;
            console.log('onClick', { action, id });
            if (!action) return;
            let
                optimisticData = null;
            const
                getPromise = async () => {
                    switch (action) {
                        case DELETE:
                            optimisticData = data.filter(el => String(el.id) !== id);
                            return fetch(API_URL + '/' + id, { method: 'DELETE' })
                                .then(res => {
                                    if (!res.ok) {
                                        throw (new Error(res.status + ' ' + res.statusText));
                                    }
                                });
                        case ADD: {
                            const
                                newObj = {};
                            config.columns.map(({ setVal }, i) => setVal && Object.assign(newObj, setVal(addFormValues[i])));
                            optimisticData = data.concat(newObj);
                            return fetch(API_URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(newObj)
                            }).then(res => {
                                if (!res.ok) {
                                    throw (new Error(res.status + ' ' + res.statusText));
                                }
                            });
                        }
                        case START_EDIT:
                            setEditedId(id);
                            const
                                editedData = data.find(el => String(el.id) === id);
                            setEditFormValues(
                                config.columns.map(({ setVal, getVal }) =>
                                    getVal && setVal
                                        ? getVal(editedData)
                                        : ''))
                            return;

                        case CANCEL_EDIT:
                            setEditedId(null);
                            return;
                        case EDIT: {
                            const
                                index = data.findIndex((obj) => String(obj.id) === String(editedId)),
                                clone = structuredClone(data[index]);
                                //newObj = {};
                            //config.columns.map(({ setVal }, i) => setVal && Object.assign(newObj, setVal(editFormValues[i])));
                            config.columns.map(({ setVal }, i) => setVal && Object.assign(clone, setVal(editFormValues[i])));
                            optimisticData = data.with(index, clone);
                            setEditedId(null);
                            return fetch(API_URL + '/' + editedId, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(clone)
                            }).then(res => {
                                if (!res.ok) {
                                    throw (new Error(res.status + ' ' + res.statusText));
                                }
                            })
                        }
                    }

                },
                promise = getPromise();

            if (promise) {
                toast.promise(promise, {
                    loading: 'Fetching ' + action,
                    success: 'ok',
                    error: (err) => `${err.toString()}`,
                });

                await mutate(promise.then(() => optimisticData, () => infoFetcher()), { optimisticData, revalidate: true });
            }
        };

    return <>
        <div style={{ position: 'absolute', fontSize: 'xxx-large' }}>
            {isLoading && '⌛'}
            {isValidating && '👁'}
        </div>
        {error && <ErrorInfo error={error} />}
        <fieldset onClick={onClick} >
            <DataForm columns={config.columns} values={addFormValues} setValues={setAddFormValues} >
                <Button action={ADD}>➕ Add</Button>
            </DataForm>
            <div>
                {data &&
                    <List list={data}
                        editForm={<DataForm columns={config.columns} values={editFormValues} setValues={setEditFormValues} >
                            <Button action={EDIT}>✔️ ок </Button>
                            <Button action={CANCEL_EDIT} > ❌</Button>
                        </DataForm>}
                        editedId={editedId}   />
                }
            </div>
            {/* <Button action={DEL_COMPLETED_ACTION}>Del completed</Button> */}
        </fieldset>
    </>;
}












