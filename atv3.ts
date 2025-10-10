import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';

enum StatusExemplar {
    DISPONIVEL = 'Disponivel',
    EMPRESTADO = 'Emprestado',
    DANIFICADO = 'Danificado'
}

enum EstadoEmprestimo {
    ATIVO = 'Ativo',
    CONCLUIDO = 'Concluido'
}

class Livro {
    constructor(
        public titulo: string,
        public autor: string,
        public editora: string,
        public genero: string,
        public ano: number
    ) {}
}

class Exemplar {
    constructor(
        public id: string,
        public livro: Livro,
        public status: StatusExemplar = StatusExemplar.DISPONIVEL
    ) {}
}

class Usuario {
    constructor(
        public id: string,
        public nome: string
    ) {}
}

class Emprestimo {
    constructor(
        public usuario: Usuario,
        public exemplar: Exemplar,
        public dataInicio: Date,
        public dataDevolucao?: Date,
        public estado: EstadoEmprestimo = EstadoEmprestimo.ATIVO
    ) {}

    diasAtraso(hoje: Date): number {
        if (this.estado === EstadoEmprestimo.CONCLUIDO || !this.dataDevolucao) {
            const prazoFim = new Date(this.dataInicio);
            prazoFim.setDate(prazoFim.getDate() + 14);
            
            if (hoje <= prazoFim) {
                return 0;
            }
            
            const diffTime = hoje.getTime() - prazoFim.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        } else {
            const prazoFim = new Date(this.dataInicio);
            prazoFim.setDate(prazoFim.getDate() + 14);
            
            if (this.dataDevolucao <= prazoFim) {
                return 0;
            }
            
            const diffTime = this.dataDevolucao.getTime() - prazoFim.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        }
    }
}

class Penalidade {
    constructor(
        public usuario: Usuario,
        public dataInicio: Date,
        public diasDuracao: number,
        public motivo: string
    ) {}
}

class Biblioteca {
    private emprestimos: Emprestimo[] = [];
    private exemplares: Exemplar[] = [];
    private usuarios: Usuario[] = [];
    private penalidades: Penalidade[] = [];
    private exemplaresDanificados: Exemplar[] = [];

    emprestar(usuario: Usuario, exemplar: Exemplar, dataInicio: Date): void {
        if (exemplar.status !== StatusExemplar.DISPONIVEL) {
            throw new Error(`Exemplar ${exemplar.id} não está disponível. Status atual: ${exemplar.status}`);
        }

        if (this.estaBloqueado(usuario, dataInicio)) {
            throw new Error(`Usuário ${usuario.nome} está bloqueado e não pode realizar empréstimos`);
        }

        const emprestimosAtivos = this.emprestimos.filter(
            e => e.usuario.id === usuario.id && e.estado === EstadoEmprestimo.ATIVO
        );
        
        if (emprestimosAtivos.length >= 3) {
            throw new Error(`Usuário ${usuario.nome} já possui o máximo de 3 livros emprestados`);
        }

        const novoEmprestimo = new Emprestimo(usuario, exemplar, dataInicio);
        
        exemplar.status = StatusExemplar.EMPRESTADO;
        this.emprestimos.push(novoEmprestimo);
    }

    devolver(usuario: Usuario, exemplar: Exemplar, dataDevolucao: Date): void {
        const emprestimo = this.emprestimos.find(
            e => e.usuario.id === usuario.id && 
                 e.exemplar.id === exemplar.id && 
                 e.estado === EstadoEmprestimo.ATIVO
        );

        if (!emprestimo) {
            throw new Error(`Não foi encontrado empréstimo ativo para ${usuario.nome} e exemplar ${exemplar.id}`);
        }

        emprestimo.dataDevolucao = dataDevolucao;
        emprestimo.estado = EstadoEmprestimo.CONCLUIDO;
        exemplar.status = StatusExemplar.DISPONIVEL;

        const diasAtraso = emprestimo.diasAtraso(dataDevolucao);
        if (diasAtraso > 0) {
            const penalidade = new Penalidade(
                usuario,
                dataDevolucao,
                diasAtraso,
                `Devolução com ${diasAtraso} dias de atraso`
            );
            this.penalidades.push(penalidade);
        }
    }

    estaBloqueado(usuario: Usuario, dataHoje: Date): boolean {
        const penalidadesAtivas = this.penalidades.filter(p => {
            const dataFim = new Date(p.dataInicio);
            dataFim.setDate(dataFim.getDate() + p.diasDuracao);
            return p.usuario.id === usuario.id && dataHoje <= dataFim;
        });
        return penalidadesAtivas.length > 0;
    }

    registrarDevolucaoDanificada(usuario: Usuario, exemplar: Exemplar, dataDevolucao: Date): void {
        const emprestimo = this.emprestimos.find(
            e => e.usuario.id === usuario.id && 
                 e.exemplar.id === exemplar.id && 
                 e.estado === EstadoEmprestimo.ATIVO
        );

        if (!emprestimo) {
            throw new Error(`Não foi encontrado empréstimo ativo para ${usuario.nome} e exemplar ${exemplar.id}`);
        }

        emprestimo.dataDevolucao = dataDevolucao;
        emprestimo.estado = EstadoEmprestimo.CONCLUIDO;
        exemplar.status = StatusExemplar.DANIFICADO;
        this.exemplaresDanificados.push(exemplar);

        const diasAtraso = emprestimo.diasAtraso(dataDevolucao);
        if (diasAtraso > 0) {
            const penalidade = new Penalidade(
                usuario,
                dataDevolucao,
                diasAtraso,
                `Exemplar danificado - devolução com ${diasAtraso} dias de atraso`
            );
            this.penalidades.push(penalidade);
        }
    }
}


console.log('=== TESTE 1: Empréstimo e devolução dentro do prazo ===');
const biblioteca = new Biblioteca();
const livro1 = new Livro('O Senhor dos Anéis', 'J.R.R. Tolkien', 'Martins Fontes', 'Fantasia', 1954);
const exemplar1 = new Exemplar('EXP001', livro1);
const usuario1 = new Usuario('USER001', 'João Silva');

const dataInicio = new Date('2025-01-01');
const dataDevolucao = new Date('2025-01-10'); 

biblioteca.emprestar(usuario1, exemplar1, dataInicio);
biblioteca.devolver(usuario1, exemplar1, dataDevolucao);

const emprestimo = new Emprestimo(usuario1, exemplar1, dataInicio, dataDevolucao);
console.log(`Dias de atraso: ${emprestimo.diasAtraso(dataDevolucao)}`);

console.log('\n=== TESTE 2: Tentar emprestar exemplar já emprestado ===');
try {
    const usuario2 = new Usuario('USER002', 'Maria Santos');
    biblioteca.emprestar(usuario1, exemplar1, new Date('2025-01-15'));
    biblioteca.emprestar(usuario2, exemplar1, new Date('2025-01-16'));
} catch (error) {
    console.error('Erro:', error instanceof Error ? error.message : error);
}

console.log('\n=== TESTE 3: Tentar emprestar 4º livro para o mesmo usuário ===');
try {
    const livro2 = new Livro('1984', 'George Orwell', 'Companhia das Letras', 'Ficção Científica', 1949);
    const livro3 = new Livro('Dom Casmurro', 'Machado de Assis', 'Ática', 'Romance', 1899);
    const livro4 = new Livro('O Cortiço', 'Aluísio Azevedo', 'Ática', 'Romance', 1890);
    const livro5 = new Livro('Capitães da Areia', 'Jorge Amado', 'Record', 'Romance', 1937);
    
    const exemplar2 = new Exemplar('EXEMPLAR1', livro2);
    const exemplar3 = new Exemplar('EXEMPLAR2', livro3);
    const exemplar4 = new Exemplar('EXEMPLAR3', livro4);
    const exemplar5 = new Exemplar('EXEMPLAR4', livro5);
    
    biblioteca.emprestar(usuario1, exemplar2, new Date('2025-02-01'));
    biblioteca.emprestar(usuario1, exemplar3, new Date('2025-02-01'));
    biblioteca.emprestar(usuario1, exemplar4, new Date('2025-02-01'));
    biblioteca.emprestar(usuario1, exemplar5, new Date('2025-02-01'));
} catch (error) {
    console.error('Erro:', error instanceof Error ? error.message : error);
}

console.log('\n=== TESTE 4: Devolução após 20 dias (deve ter 6 dias de atraso) ===');
const emprestimoAtrasado = new Emprestimo(usuario1, exemplar1, new Date('2025-01-01'));
const dataDevolucaoAtrasada = new Date('2025-01-21'); 
const diasAtraso = emprestimoAtrasado.diasAtraso(dataDevolucaoAtrasada);
console.log(`Dias de atraso: ${diasAtraso}`);



describe('Sistema de Penalidades', () => {
    test('Devolver com 5 dias de atraso → usuário fica bloqueado por 5 dias', () => {
        const biblioteca = new Biblioteca();
        const livro = new Livro('Teste Penalidade', 'Autor', 'Editora', 'Gênero', 2025);
        const exemplar = new Exemplar('PENALIDADE1', livro);
        const usuario = new Usuario('PENANILIDADE2', 'Usuario Penalidade');

        biblioteca.emprestar(usuario, exemplar, new Date('2025-01-01'));
        
        biblioteca.devolver(usuario, exemplar, new Date('2025-01-20'));

        assert.equal(biblioteca.estaBloqueado(usuario, new Date('2025-01-20')), true);
        
        assert.equal(biblioteca.estaBloqueado(usuario, new Date('2025-01-24')), true);
        assert.equal(biblioteca.estaBloqueado(usuario, new Date('2025-01-25')), true);
        
        assert.equal(biblioteca.estaBloqueado(usuario, new Date('2025-01-26')), false);
    });

    test('Usuário bloqueado tentar emprestar antes do fim do bloqueio → deve lançar erro', () => {
        const biblioteca = new Biblioteca();
        const livro1 = new Livro('Teste Bloqueio', 'Autor', 'Editora', 'Gênero', 2025);
        const livro2 = new Livro('Teste Bloqueio 2', 'Autor', 'Editora', 'Gênero', 2025);
        const exemplar1 = new Exemplar('BLOQUEADO1', livro1);
        const exemplar2 = new Exemplar('BLOQUEADO2', livro2);
        const usuario = new Usuario('BLOQ001', 'Usuario Bloqueado');

        biblioteca.emprestar(usuario, exemplar1, new Date('2025-01-01'));
        biblioteca.devolver(usuario, exemplar1, new Date('2025-01-20'));

        assert.throws(
            () => biblioteca.emprestar(usuario, exemplar2, new Date('2025-01-22')),
            Error,
            'Usuário Usuario Bloqueado está bloqueado e não pode realizar empréstimos'
        );
    });

    test('Devolver exemplar como danificado → estado do exemplar deve ser Danificado e não pode mais ser emprestado', () => {
        const biblioteca = new Biblioteca();
        const livro = new Livro('Teste Danificado', 'Autor', 'Editora', 'Gênero', 2025);
        const exemplar = new Exemplar('DAN001', livro);
        const usuario1 = new Usuario('DANIFICADO1', 'Usuario Danificado');
        const usuario2 = new Usuario('DANIFICADO2', 'Usuario Teste');

        biblioteca.emprestar(usuario1, exemplar, new Date('2025-01-01'));
        
        biblioteca.registrarDevolucaoDanificada(usuario1, exemplar, new Date('2025-01-15'));

        assert.equal(exemplar.status, StatusExemplar.DANIFICADO);

        assert.throws(
            () => biblioteca.emprestar(usuario2, exemplar, new Date('2025-01-20')),
            Error,
            'Exemplar DAN001 não está disponível. Status atual: Danificado'
        );
    });
});
