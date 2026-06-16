 // --- 1. CLASSES DE ENTIDADE (MODELOS) ---
        class Entidade {
            constructor() {
                this.id = '_' + Math.random().toString(36).substr(2, 9);
            }
        }

        class Colaborador extends Entidade {
            constructor(nome, cpf, setorId, cargoId) {
                super();
                this.nome = nome;
                this.cpf = cpf;
                this.setorId = setorId;
                this.cargoId = cargoId;
            }
            validar() { return this.nome.trim() !== '' && this.cpf.trim() !== ''; } // Método 6
        }

        class Setor extends Entidade {
            constructor(nome, local) {
                super();
                this.nome = nome;
                this.local = local;
            }
            obterInfoCompleta() { return `${this.nome} (${this.local})`; } // Método 13
        }

        class Cargo extends Entidade {
            constructor(nome, risco) {
                super();
                this.nome = nome;
                this.risco = risco;
            }
            obterRiscoFormatado() { return `Risco: ${this.risco}`; } // Método 14
        }

        class EPI extends Entidade {
            constructor(nome, ca, qtd) {
                super();
                this.nome = nome;
                this.ca = ca;
                this.qtd = parseInt(qtd) || 0;
            }
            atualizarEstoque(quantidade) { this.qtd += parseInt(quantidade); } // Método 7
        }

        class EntregaEPI extends Entidade {
            constructor(colabId, epiId, data, qtdEntregue) {
                super();
                this.colabId = colabId;
                this.epiId = epiId;
                this.data = data;
                this.qtdEntregue = parseInt(qtdEntregue) || 1;
            }
            obterDataFormatada() { return new Date(this.data).toLocaleDateString('pt-BR'); } // Método 8
        }

        class ExameMedico extends Entidade {
            constructor(colabId, tipo, data, resultado) {
                super();
                this.colabId = colabId;
                this.tipo = tipo; // Admissional, Periódico, Demissional
                this.data = data;
                this.resultado = resultado; // Apto ou Inapto
            }
            verificarAptidao() { return this.resultado === 'Apto'; } // Método 9
        }

        class Treinamento extends Entidade {
            constructor(nome, data, cargaHoraria) {
                super();
                this.nome = nome;
                this.data = data;
                this.cargaHoraria = cargaHoraria;
            }
            estaValido(dataAtual) { // Método 11
                const umAnoEmMs = 365 * 24 * 60 * 60 * 1000;
                return (new Date(dataAtual) - new Date(this.data)) < umAnoEmMs;
            }
        }

        class RegistroAcidente extends Entidade {
            constructor(colabId, data, descricao, gravidade) {
                super();
                this.colabId = colabId;
                this.data = data;
                this.descricao = descricao;
                this.gravidade = gravidade; // Leve, Moderado, Crítico
            }
            classificarRisco() { return this.gravidade === 'Crítico' ? 'ALERTA MÁXIMO' : 'Acompanhamento'; } // Método 10
        }

        class InspecaoSeguranca extends Entidade {
            constructor(setorId, data, status, observacao) {
                super();
                this.setorId = setorId;
                this.data = data;
                this.status = status; // Aprovado ou Reprovado
                this.observacao = observacao;
            }
            obterStatusBadge() { return this.status === 'Aprovado' ? 'success' : 'danger'; } // Método 12
        }

        // --- 2. ENGINE BACK-END CORE DO SISTEMA ---
        class SSTSystem {
            constructor() {
                this.banco = {
                    colaboradores: [], setores: [], cargos: [], epis: [],
                    entregas: [], exames: [], treinamentos: [], inspecoes: [], acidentes: []
                };
                this.carregarStorage();
            }

            salvarStorage() { localStorage.setItem('sst_db', JSON.stringify(this.banco)); } // Método 15
            carregarStorage() { // Método 16
                const dados = localStorage.getItem('sst_db');
                if (dados) this.banco = JSON.parse(dados);
            }

            cadastrar(modulo, objeto) { // Método 1
                this.banco[modulo].push(objeto);
                this.salvarStorage();
            }

            listar(modulo) { return this.banco[modulo] || []; } // Método 2

            atualizar(modulo, id, novosDados) { // Método 3
                const index = this.banco[modulo].findIndex(item => item.id === id);
                if (index !== -1) {
                    this.banco[modulo][index] = { ...this.banco[modulo][index], ...novosDados };
                    this.salvarStorage();
                    return true;
                }
                return false;
            }

            excluir(modulo, id) { // Método 4
                const index = this.banco[modulo].findIndex(item => item.id === id);
                if (index !== -1) {
                    this.banco[modulo].splice(index, 1);
                    this.salvarStorage();
                    return true;
                }
                return false;
            }

            gerarRelatorioGeral() { // Método 5
                return {
                    totalColaboradores: this.banco.colaboradores.length,
                    totalAcidentes: this.banco.acidentes.length,
                    totalEntregas: this.banco.entregas.reduce((acc, e) => acc + (e.qtdEntregue || 1), 0),
                    totalInspecoes: this.banco.inspecoes.length
                };
            }
        }

        // --- 3. FRONT-END INTERACTION CONTROLLER ---
        class AppFront {
            constructor() {
                this.backend = new SSTSystem();
                this.moduloAtual = 'dashboard';
                this.inicializarMassaDadosSimulada();
            }

            inicializarMassaDadosSimulada() {
                // Se o banco estiver vazio, popula para demonstração inicial limpa
                if(this.backend.listar('setores').length === 0) {
                    this.backend.cadastrar('setores', new Setor('Produção Industrial', 'Galpão A'));
                    this.backend.cadastrar('cargos', new Cargo('Operador de Máquinas', 'Alto'));
                    this.backend.cadastrar('colaboradores', new Colaborador('João Silva', '123.456.789-00', this.backend.listar('setores')[0].id, this.backend.listar('cargos')[0].id));
                    this.backend.cadastrar('epis', new EPI('Protetor Auricular Plug', 'CA-11234', 50));
                }
            }

            mudarModulo(modulo) {
                this.moduloAtual = modulo;
                document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
                const btn = document.getElementById(`btn-${modulo}`);
                if(btn) btn.classList.add('active');

                const title = document.getElementById('page-title');
                title.innerText = modulo.charAt(0).toUpperCase() + modulo.slice(1);

                if (modulo === 'dashboard') {
                    document.getElementById('view-dashboard').classList.remove('hidden');
                    document.getElementById('view-crud').classList.add('hidden');
                    this.renderizarDashboard();
                } else {
                    document.getElementById('view-dashboard').classList.add('hidden');
                    document.getElementById('view-crud').classList.remove('hidden');
                    this.renderizarFormularioECrud();
                }
            }

            renderizarDashboard() {
                const dados = this.backend.gerarRelatorioGeral();
                document.getElementById('dash-colab').innerText = dados.totalColaboradores;
                document.getElementById('dash-acidentes').innerText = dados.totalAcidentes;
                document.getElementById('dash-epis').innerText = dados.totalEntregas;
                document.getElementById('dash-inspecoes').innerText = dados.totalInspecoes;

                // Alertas dinâmicos baseados nas instâncias de POO
                const corpoAlertas = document.getElementById('dash-alertas-corpo');
                corpoAlertas.innerHTML = '';
                
                const acidentes = this.backend.listar('acidentes');
                if(acidentes.length > 0) {
                    acidentes.forEach(a => {
                        const objFake = new RegistroAcidente(a.colabId, a.data, a.descricao, a.gravidade);
                        if(objFake.classificarRisco() === 'ALERTA MÁXIMO') {
                            corpoAlertas.innerHTML += `<tr><td><span class="badge danger">Acidente</span></td><td><strong>Ocorrência grave detectada:</strong> ${a.descricao}</td></tr>`;
                        }
                    });
                } else {
                    corpoAlertas.innerHTML = `<tr><td colspan="2" style="text-align: center; color: gray;">Nenhum alerta crítico gerado via regras de POO.</td></tr>`;
                }
            }

            renderizarFormularioECrud() {
                const container = document.getElementById('inputs-container');
                const table = document.getElementById('data-table');
                document.getElementById('form-title').innerText = `Cadastrar em: ${this.moduloAtual.toUpperCase()}`;
                this.limparFormulario();

                let inputsHTML = '';
                const m = this.moduloAtual;

                if (m === 'colaboradores') {
                    inputsHTML = `
                        <div><label>Nome do Colaborador</label><input type="text" id="inp-nome" required></div>
                        <div><label>CPF</label><input type="text" id="inp-cpf" placeholder="000.000.000-00" required></div>
                        <div><label>Setor</label><select id="inp-setorId">${this.optionsSelect('setores')}</select></div>
                        <div><label>Cargo</label><select id="inp-cargoId">${this.optionsSelect('cargos')}</select></div>`;
                } else if (m === 'setores') {
                    inputsHTML = `
                        <div><label>Nome do Setor</label><input type="text" id="inp-nome" required></div>
                        <div><label>Localização / Galpão</label><input type="text" id="inp-local" required></div>`;
                } else if (m === 'cargos') {
                    inputsHTML = `
                        <div><label>Nome do Cargo</label><input type="text" id="inp-nome" required></div>
                        <div><label>Nível de Risco Ocupacional</label><select id="inp-risco"><option>Baixo</option><option>Médio</option><option>Alto</option></select></div>`;
                } else if (m === 'epis') {
                    inputsHTML = `
                        <div><label>Nome do EPI</label><input type="text" id="inp-nome" required></div>
                        <div><label>Número do CA</label><input type="text" id="inp-ca" required></div>
                        <div><label>Quantidade em Estoque</label><input type="number" id="inp-qtd" required></div>`;
                } else if (m === 'entregas') {
                    inputsHTML = `
                        <div><label>Colaborador Recebedor</label><select id="inp-colabId">${this.optionsSelect('colaboradores')}</select></div>
                        <div><label>EPI Solicitado</label><select id="inp-epiId">${this.optionsSelect('epis')}</select></div>
                        <div><label>Data de Entrega</label><input type="date" id="inp-data" required></div>
                        <div><label>Qtd Retirada</label><input type="number" id="inp-qtdEntregue" value="1" required></div>`;
                } else if (m === 'exames') {
                    inputsHTML = `
                        <div><label>Colaborador</label><select id="inp-colabId">${this.optionsSelect('colaboradores')}</select></div>
                        <div><label>Tipo de Exame</label><select id="inp-tipo"><option>Admissional</option><option>Periódico</option><option>Demissional</option></select></div>
                        <div><label>Data Realização</label><input type="date" id="inp-data" required></div>
                        <div><label>Resultado Clínica</label><select id="inp-resultado"><option>Apto</option><option>Inapto</option></select></div>`;
                } else if (m === 'treinamentos') {
                    inputsHTML = `
                        <div><label>Nome do Treinamento / NR</label><input type="text" id="inp-nome" required></div>
                        <div><label>Data de Realização</label><input type="date" id="inp-data" required></div>
                        <div><label>Carga Horária (Horas)</label><input type="number" id="inp-cargaHoraria" required></div>`;
                } else if (m === 'inspecoes') {
                    inputsHTML = `
                        <div><label>Setor Inspecionado</label><select id="inp-setorId">${this.optionsSelect('setores')}</select></div>
                        <div><label>Data Auditoria</label><input type="date" id="inp-data" required></div>
                        <div><label>Status Final</label><select id="inp-status"><option>Aprovado</option><option>Reprovado</option></select></div>
                        <div><label>Observação Técnica</label><input type="text" id="inp-observacao"></div>`;
                } else if (m === 'acidentes') {
                    inputsHTML = `
                        <div><label>Colaborador Acidentado</label><select id="inp-colabId">${this.optionsSelect('colaboradores')}</select></div>
                        <div><label>Data do Fato</label><input type="date" id="inp-data" required></div>
                        <div><label>Gravidade</label><select id="inp-gravidade"><option>Leve</option><option>Moderado</option><option>Crítico</option></select></div>
                        <div><label>Descrição Ocorrência</label><input type="text" id="inp-descricao" required></div>`;
                }

                container.innerHTML = inputsHTML;
                this.construirTabelaDados(m, table);
            }

            optionsSelect(modulo) {
                const lista = this.backend.listar(modulo);
                if(lista.length === 0) return `<option value="">Nenhum item cadastrado no sistema</option>`;
                return lista.map(item => `<option value="${item.id}">${item.nome || item.descricao || item.id}</option>`).join('');
            }

            construirTabelaDados(modulo, elementoTabela) {
                const dados = this.backend.listar(modulo);
                if (dados.length === 0) {
                    elementoTabela.innerHTML = `<tr><td style="color:gray; padding:20px;">Nenhum registro para exibir. Adicione um acima.</td></tr>`;
                    return;
                }

                // Chaves de cabeçalho dinâmico excluindo o ID puro
                const chaves = Object.keys(dados[0]).filter(k => k !== 'id');
                
                let headerHTML = '<thead><tr>';
                chaves.forEach(c => headerHTML += `<th>${c.toUpperCase()}</th>`);
                headerHTML += '<th>AÇÕES TÉCNICAS</th></tr></thead><tbody>';

                let bodyHTML = '';
                dados.forEach(item => {
                    bodyHTML += '<tr>';
                    chaves.forEach(c => {
                        bodyHTML += `<td>${item[c]}</td>`;
                    });
                    bodyHTML += `
                        <td>
                            <div class="actions-btn">
                                <button class="btn-edit" onclick="app.carregarDadosParaEdicao('${modulo}', '${item.id}')">Editar</button>
                                <button class="btn-del" onclick="app.deletarRegistro('${modulo}', '${item.id}')">Excluir</button>
                            </div>
                        </td></tr>`;
                });

                bodyHTML += '</tbody>';
                elementoTabela.innerHTML = headerHTML + bodyHTML;
            }

            handleFormSubmit(e) {
                e.preventDefault();
                const idEdicao = document.getElementById('edit-id').value;
                const m = this.moduloAtual;
                let payload = {};

                // Mapeamento dinâmico automático com base nos elementos injetados na tela
                const inputs = document.getElementById('inputs-container').querySelectorAll('input, select, textarea');
                inputs.forEach(i => {
                    const chave = i.id.replace('inp-', '');
                    payload[chave] = i.value;
                });

                if (idEdicao) {
                    // Executa método de Edição da Regra de Negócio (Back-End)
                    this.backend.atualizar(m, idEdicao, payload);
                } else {
                    // Instanciação dinâmica simulando a conversão de request para objeto POO Real
                    let objInstanciado;
                    if(m === 'colaboradores') objInstanciado = new Colaborador(payload.nome, payload.cpf, payload.setorId, payload.cargoId);
                    else if(m === 'setores') objInstanciado = new Setor(payload.nome, payload.local);
                    else if(m === 'cargos') objInstanciado = new Cargo(payload.nome, payload.risco);
                    else if(m === 'epis') objInstanciado = new EPI(payload.nome, payload.ca, payload.qtd);
                    else if(m === 'entregas') objInstanciado = new EntregaEPI(payload.colabId, payload.epiId, payload.data, payload.qtdEntregue);
                    else if(m === 'exames') objInstanciado = new ExameMedico(payload.colabId, payload.tipo, payload.data, payload.resultado);
                    else if(m === 'treinamentos') objInstanciado = new Treinamento(payload.nome, payload.data, payload.cargaHoraria);
                    else if(m === 'inspecoes') objInstanciado = new InspecaoSeguranca(payload.setorId, payload.data, payload.status, payload.observacao);
                    else if(m === 'acidentes') objInstanciado = new RegistroAcidente(payload.colabId, payload.data, payload.descricao, payload.gravidade);

                    this.backend.cadastrar(m, objInstanciado);
                }

                this.renderizarFormularioECrud();
            }

            carregarDadosParaEdicao(modulo, id) {
                const lista = this.backend.listar(modulo);
                const item = lista.find(x => x.id === id);
                if(!item) return;

                document.getElementById('edit-id').value = item.id;
                document.getElementById('form-title').innerText = `Editando ID: ${id}`;

                Object.keys(item).forEach(key => {
                    const input = document.getElementById(`inp-${key}`);
                    if(input) input.value = item[key];
                });
            }

            deletarRegistro(modulo, id) {
                if(confirm('Confirmar exclusão física do registro técnico?')) {
                    this.backend.excluir(modulo, id);
                    this.renderizarFormularioECrud();
                }
            }

            limparFormulario() {
                document.getElementById('edit-id').value = '';
                document.getElementById('dinamic-form').reset();
                document.getElementById('form-title').innerText = `Cadastrar em: ${this.moduloAtual.toUpperCase()}`;
            }
        }

        // Inicialização Global da Aplicação
        const app = new AppFront();
        document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR');