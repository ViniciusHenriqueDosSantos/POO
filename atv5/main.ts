import { Task } from "./classes/Task";
import { User } from "./classes/User";

async function main() {
  console.log("=== To do List ===");

  const usuario = new User("Vinicius", "vinicius@email.com");
  const usuarioSalvo = await usuario.save();
  console.log("User created:", usuarioSalvo);

  const tarefa = new Task("Study POO", usuarioSalvo.id);
  const tarefaSalva = await tarefa.save();
  console.log("Tasks created:", tarefaSalva);

  const tarefas = await Task.list();
  console.log("Tasks:", tarefas);

  const tarefaConcluida = await Task.markAsConcluded(tarefaSalva.id);
  console.log("Tasks completed:", tarefaConcluida);

  const usuarios = await Task.list();
  console.log("Users with tasks:", usuarios);
}

main();
