/**
 * Integrantes do laboratorio que podem ser selecionados como responsaveis
 * pela elaboracao de um orcamento. Edite esta lista para adicionar,
 * remover ou renomear membros da equipe.
 */
export const labMembers = [
  "Maicon",
  "Kathelean",
  "Ana Rebeca",
  "Geovana",
  "Leonor",
  "Rafael",
  "Maíra",
  "Giovanna",
  "Igor",
  "Karen",
] as const;

export type LabMemberName = (typeof labMembers)[number];
