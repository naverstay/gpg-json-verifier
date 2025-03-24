import {useState} from 'react';
import * as openpgp from 'openpgp';

function App() {
  const [jsonFile, setJsonFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [vks, setVks] = useState('699E49BE332C3B67');
  const [result, setResult] = useState(null);

  const fetchPublicKey = async () => {
    try {
      const response = await fetch('https://keys.openpgp.org/vks/v1/by-keyid/' + vks);
      return await response.text()
    } catch (error) {
      console.error('Ошибка загрузки ключа:', error);

      return false
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jsonFile || !signatureFile) {
      alert('Выберите JSON и подпись');
      return;
    }

    try {
      const key = await fetchPublicKey();

      if (key) {
        // Чтение содержимого файлов
        const jsonData = await jsonFile.text();
        const signatureData = await signatureFile.text();

        // Загрузка публичного ключа
        const publicKeyObj = await openpgp.readKey({armoredKey: key});

        // Чтение подписи
        const signature = await openpgp.readSignature({armoredSignature: signatureData});

        // Проверка подписи
        const {verified} = await openpgp.verify({
          message: await openpgp.createMessage({text: jsonData}),
          signature,
          verificationKeys: publicKeyObj
        });

        try {
          await verified;
          setResult({
            success: true,
            message: '✅ Подпись подтверждена!',
            data: JSON.parse(jsonData)
          });
        } catch (err) {
          setResult({
            success: false,
            message: `❌ Подпись неверна: ${err.message}`
          });
        }
      } else {
        setResult({
          success: false,
          message: `❌ Ошибка загрузки ключа`
        });
      }
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        message: `❌ Ошибка: ${err.message}`
      });
    }
  };

  return (
    <div className="app">
      <h1>Проверка GPG-подписи JSON</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="recvFile">recv-keys</label>
        <input id="recvFile" value={vks} onChange={(e) => setVks(e.target.value)}/>
        <label htmlFor="jsonFile">JSON File</label>
        <input id="jsonFile" type="file" accept=".json" onChange={(e) => setJsonFile(e.target.files[0])}/>
        <label htmlFor="jsonFile">ASC File</label>
        <input type="file" accept=".asc" onChange={(e) => setSignatureFile(e.target.files[0])}/>
        <button type="submit">Проверить подпись</button>
      </form>

      {result && (
        <div className="result">
          <h2>{result.success ? '✅ Успех' : '❌ Ошибка'}</h2>
          <p>{result.message}</p>
          {result.success && (
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
