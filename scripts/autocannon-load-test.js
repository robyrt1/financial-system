const autocannon = require('autocannon');

console.log('Iniciando teste de carga de autenticação no API Gateway (http://localhost:4000)...');

const instance = autocannon({
  url: 'http://localhost:4000',
  connections: 50, // 50 conexões simultâneas
  duration: 20,    // 20 segundos de duração
  pipelining: 1,
  title: 'Financial System Auth Stress Test',
  requests: [
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      headers: {
        'content-type': 'application/json'
      },
      // Realiza login simulando credenciais comuns
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123'
      })
    }
  ]
}, (err, result) => {
  if (err) {
    console.error('Erro durante o teste de carga:', err);
    return;
  }
  console.log('\n--- Resultado do Teste de Carga ---');
  console.log(autocannon.printResult(result));
});

// Exibe a barra de progresso no terminal durante a execução
autocannon.track(instance, { renderProgressBar: true });
