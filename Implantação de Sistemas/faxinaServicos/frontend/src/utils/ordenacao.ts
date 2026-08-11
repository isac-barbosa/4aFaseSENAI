interface ItemOrdenavel {
  data: string;
  horaInicio: string;
}

export function ordenarPorDataHora<T extends ItemOrdenavel>(lista: T[]): T[] {
  const array = [...lista]; // não altera o array original

  for (let i = 1; i < array.length; i++) {
    const atual = array[i];
    let j = i - 1;

    // chave de comparação: data + hora concatenadas (ex: "2026-08-1009:00:00")
    const chaveAtual = atual.data + atual.horaInicio;

    while (j >= 0 && array[j].data + array[j].horaInicio > chaveAtual) {
      array[j + 1] = array[j];
      j--;
    }

    array[j + 1] = atual;
  }

  return array;
}
