import { useState, useEffect } from 'react'
// Importamos o cliente da pasta lib (o ponto ./ significa "aqui na raiz")
import { supabase } from './lib/supabaseClient'

function App() {
  const [status, setStatus] = useState("🟡 A testar conexão com Supabase...")

  useEffect(() => {
    verificarConexao()
  }, [])

  async function verificarConexao() {
    try {
      // Tenta buscar dados. Se a tabela não existir, vai dar erro, mas prova que conectou.
      const { data, error } = await supabase.from('testes').select('*')

      if (error) {
        // Se o erro mencionar que a tabela não existe, é SUCESSO de conexão!
        if (error.message.includes("relation") || error.message.includes("does not exist")) {
           setStatus("🟢 CONEXÃO OK! (Conectado ao banco, mas a tabela 'testes' não existe).")
        } else {
           setStatus("🔴 ERRO DO BANCO: " + error.message)
        }
      } else {
        setStatus("🟢 SUCESSO TOTAL! Conexão feita e dados encontrados.")
      }
    } catch (err) {
      setStatus("🔴 ERRO CRÍTICO: Verifique se as chaves estão na Vercel.")
    }
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Sistema QZ - Teste</h1>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ccc', 
        marginTop: '20px', 
        borderRadius: '8px',
        fontWeight: 'bold' 
      }}>
        {status}
      </div>
    </div>
  )
}

export default App
