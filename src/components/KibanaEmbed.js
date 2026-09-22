const KibanaEmbed = () => {
    // URL avec embed=true
    const kibanaUrl = "http://localhost:5601/app/dashboards#/view/bc6d1660-c51b-11f0-818c-83451abedc3b?embed=true&_g=(refreshInterval:(pause:!t,value:60000),time:(from:now-30d%2Fd,to:now))&_a=()";

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <iframe
                src={kibanaUrl}
                title="Kibana Dashboard"
                width="100%"
                height="100%"
                style={{ border: 'none', minHeight: '100vh' }}
            />
        </div>
    );
};

export default KibanaEmbed;