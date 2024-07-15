import { useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import parse, { attributesToProps, HTMLReactParserOptions, Element  } from "html-react-parser";
import { observer } from 'mobx-react';
import { Button, Form, Input, InputNumber, Modal, Select, Tooltip } from 'antd';
import './App.css';
import { useForm } from 'antd/es/form/Form';
import { state, State } from './State';

const Path = function({ attributes, state }: { attributes: Record<string, string>, state: State }) {
    const [type, setType] = useState<any>(attributes['data-type']);
    const [office, setOffice] = useState<any>(attributes['data-office']);
    const [place, setPlace] = useState<any>(attributes['data-place']);
    const [visible, setVisible] = useState<boolean>();
    const ref = useRef<any>();
    const [form] = useForm();

    const typeValue = Form.useWatch('type', form);

    const save = (data: { office: string; place: number | null; type: string; }) => {
        setOffice(data.office);
        setPlace(data.place);
        setType(data.type);
        setVisible(false);
    }

    const handleClick = () => {
        if (state.isOperatorMode) {
            setVisible(true);
        }
    }

    const remove = () => {
        save({ office: '', place: null, type: '' });
    }

    useEffect(() => {
        form.setFieldsValue({
            type: type || 'workPlace',
            office,
            place
        });
    }, [type, office, place]);

    const tooltipPhrase = useMemo(() => {
        return (
            <>
                {office && <>Кабинет {office} <br /></>}
                {place && `Стол ${place}`}
            </>
        );
    }, [office, place]);

    const pathProps = {...attributesToProps(attributes)};

    if (!office) {
        delete pathProps['data-office'];
    } else {
        pathProps['data-office'] = office;
    }

    if (!place) {
        delete pathProps['data-place'];
    } else {
        pathProps['data-place'] = place;
    }

    if (!type) {
        delete pathProps['data-type'];
    } else {
        pathProps['data-type'] = type;
    }

    return (
        <>
            <Modal visible={visible} title="Параметры объекта " onCancel={() => setVisible(false)} onOk={form.submit}>
                <Form form={form} onFinish={save} layout="vertical">
                    <Form.Item label="Тип" name="type" rules={[{ required: true }]}>
                        <Select defaultValue="workPlace">
                            <Select.Option value="workPlace">Рабочее место</Select.Option>
                            <Select.Option value="officeFurniture">Офисная мебель</Select.Option>
                            <Select.Option value="plant">Растение</Select.Option>
                            <Select.Option value="glassPartition">Стеклянная перегородка</Select.Option>
                            <Select.Option value="plumbing">Сантехника</Select.Option>
                        </Select>
                    </Form.Item>

                    {typeValue === 'workPlace' && (
                        <>
                            <Form.Item label="Кабинет" name="office">
                                <Input style={{ width: '100%' }}/>
                            </Form.Item>

                            <Form.Item label="Стол" name="place" rules={[{ required: true }]}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </>
                    )}
                </Form>

                <Button onClick={remove}>Удалить</Button>
            </Modal>

            <Tooltip title={(office || place) && tooltipPhrase}>
                <path {...pathProps} ref={ref} onClick={handleClick} fill="white" />
            </Tooltip>
        </>
    )
}

function convertSvgToReact(svgString: string) {
    if (svgString) {
        const options: HTMLReactParserOptions = {
          replace: (domNode: any) => {
              if (domNode instanceof Element) {
                if (domNode.name === 'path') {
                    return <Path key={(domNode as any).khid} state={state} attributes={domNode.attribs} />
                }

                return domNode;
              }

              return domNode;
          }
        };

        return parse(svgString, options);
    }
}

export default observer(function App({ state }: { state: State }) {
    const svgRef = useRef<any>();
    const [svgMapString, setSvgMapString] = useState<any>();
    const svgMap = useMemo(() => convertSvgToReact(svgMapString), [svgMapString]);

    function saveSvg() {
        const svg = svgRef.current.querySelector('svg').outerHTML;
        const blob = new Blob([svg.toString()]);
        const element = document.createElement('a');
        element.download = 'w3c.svg';
        element.href = window.URL.createObjectURL(blob);
        element.click();
        element.remove();
    }

    function loadSvg(e: any) {
        e.target.files[0].text().then(setSvgMapString);
    }

    return (
        <div className={state.isOperatorMode ? 'operator' : ''} style={{ height: '100%' }}>
            <div style={{ position: 'absolute', zIndex: 2, width: '100%', padding: 10 }}>
                <input type="file" onChange={loadSvg} accept=".svg" multiple={false} />
                <button onClick={saveSvg}>Save</button>
            </div>

            <TransformWrapper initialScale={1} centerOnInit>
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className="tools">
                            <button
                                onClick={() => zoomOut()}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M6 12.0008C6 11.6825 6.12643 11.3773 6.35147 11.1523C6.57652 10.9272 6.88174 10.8008 7.2 10.8008H16.8C17.1183 10.8008 17.4235 10.9272 17.6485 11.1523C17.8736 11.3773 18 11.6825 18 12.0008C18 12.319 17.8736 12.6243 17.6485 12.8493C17.4235 13.0744 17.1183 13.2008 16.8 13.2008H7.2C6.88174 13.2008 6.57652 13.0744 6.35147 12.8493C6.12643 12.6243 6 12.319 6 12.0008Z"
                                        fill="#2F79B5"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    zoomIn();
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M12 6C12.3183 6 12.6235 6.12643 12.8485 6.35147C13.0736 6.57652 13.2 6.88174 13.2 7.2V10.8H16.8C17.1183 10.8 17.4235 10.9264 17.6485 11.1515C17.8736 11.3765 18 11.6817 18 12C18 12.3183 17.8736 12.6235 17.6485 12.8485C17.4235 13.0736 17.1183 13.2 16.8 13.2H13.2V16.8C13.2 17.1183 13.0736 17.4235 12.8485 17.6485C12.6235 17.8736 12.3183 18 12 18C11.6817 18 11.3765 17.8736 11.1515 17.6485C10.9264 17.4235 10.8 17.1183 10.8 16.8V13.2H7.2C6.88174 13.2 6.57652 13.0736 6.35147 12.8485C6.12643 12.6235 6 12.3183 6 12C6 11.6817 6.12643 11.3765 6.35147 11.1515C6.57652 10.9264 6.88174 10.8 7.2 10.8H10.8V7.2C10.8 6.88174 10.9264 6.57652 11.1515 6.35147C11.3765 6.12643 11.6817 6 12 6Z"
                                        fill="#2F79B5"
                                    />
                                </svg>
                            </button>
                            <button onClick={() => resetTransform()}>
                                <svg
                                    width="19"
                                    height="13"
                                    viewBox="0 0 19 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M7.58889 12.658C7.58889 12.79 7.57089 12.88 7.53489 12.928C7.49889 12.976 7.41489 13 7.28289 13H1.01889C0.886891 13 0.802891 12.976 0.766891 12.928C0.730891 12.88 0.712891 12.79 0.712891 12.658V11.542C0.712891 11.41 0.730891 11.32 0.766891 11.272C0.802891 11.224 0.886891 11.2 1.01889 11.2H3.05289V2.902L1.05489 3.226C0.922891 3.25 0.838891 3.244 0.802891 3.208C0.766891 3.16 0.748891 3.082 0.748891 2.974V1.948C0.748891 1.84 0.766891 1.756 0.802891 1.696C0.838891 1.636 0.922891 1.582 1.05489 1.534L3.88089 0.741999C4.20489 0.646 4.49289 0.646 4.74489 0.741999C5.00889 0.825999 5.14089 1.048 5.14089 1.408V11.2H7.28289C7.41489 11.2 7.49889 11.224 7.53489 11.272C7.57089 11.32 7.58889 11.41 7.58889 11.542V12.658ZM14.0183 9.472L12.0743 12.694C12.0143 12.79 11.9423 12.868 11.8583 12.928C11.7863 12.976 11.6783 13 11.5343 13H9.93227C9.70427 13 9.65627 12.886 9.78827 12.658L12.8663 8.014L10.1483 3.856C10.1123 3.796 10.1003 3.73 10.1123 3.658C10.1243 3.586 10.1843 3.55 10.2923 3.55H11.9663C12.1103 3.55 12.2183 3.574 12.2903 3.622C12.3623 3.658 12.4283 3.724 12.4883 3.82L14.0723 6.574L15.7103 3.82C15.7703 3.724 15.8363 3.658 15.9083 3.622C15.9803 3.574 16.0823 3.55 16.2143 3.55H17.8343C17.9663 3.55 18.0323 3.586 18.0323 3.658C18.0443 3.718 18.0383 3.772 18.0143 3.82L15.2243 7.942L18.3383 12.676C18.3863 12.748 18.4043 12.82 18.3923 12.892C18.3803 12.964 18.3083 13 18.1763 13H16.4663C16.2983 13 16.1783 12.976 16.1063 12.928C16.0463 12.868 15.9863 12.79 15.9263 12.694L14.0183 9.472Z"
                                        fill="#2F79B5"
                                    />
                                </svg>
                            </button>
                        </div>

                        <TransformComponent>
                            <div className="svg-container">
                                {svgMap && <div ref={svgRef}>{svgMap}</div>}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
})
