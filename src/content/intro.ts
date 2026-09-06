import type { Module } from "./modules";
import { trackLabel } from "./modules";

/**
 * Introdução da aula gerada na hora, sem IA e sem espera.
 * Texto curto, animado e concreto (bom para alunos com TDAH).
 */
export function buildModuleIntro(mod: Module): string {
  const lang = trackLabel(mod.track);
  const partes = mod.sections.map((s) => s.heading);
  const lista =
    partes.length > 1
      ? `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`
      : partes[0] ?? "o conteúdo desta aula";
  const temCodigo = mod.sections.some((s) => s.code);

  return [
    `Oi! Bem-vindo à aula ${mod.index} de ${lang}: ${mod.title}.`,
    `Em uma frase: ${mod.summary}`,
    `Aqui a gente vai passar por ${lista}.`,
    temCodigo
      ? `Não é só leitura: você vai ver exemplos de código, escrever o seu no "Pratique aqui" e conferir o resultado na hora.`
      : `Leia com calma, anote o que achar importante e responda o quiz no final para fixar.`,
    `Reserva uns ${mod.duration} sem distração, faz uma pausa se cansar e segue no seu ritmo. Bora? Você consegue!`,
  ].join(" ");
}
