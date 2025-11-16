import { GetRequest, PostRequest, PuteRequest, DeleteRequest } from './resquests';

/**
 * Função genérica para criar um registro
 */
export async function createRecord(url, data) {
  // Se for um form, transforme em JSON
  let body = new FormData(data)
  //body=data instanceof FormData ? Object.fromEntries(data) : data;
  const response = await PostRequest(url, body);
  console.log(response);
  return response;
}

/**
 * Função genérica para listar registros
 */
export async function listRecords(url) {
  const response = await GetRequest(url);
 // console.log(response);
  return response;
}

/**
 * Função genérica para atualizar registro
 */
export async function updateRecord(url, data) {
  const body = data instanceof FormData ? Object.fromEntries(data) : data;
  const response = await PuteRequest(url, body);
  console.log(response);
  return response;
}

/**
 * Função genérica para deletar registro
 */
export async function deleteRecord(url) {
  const response = await DeleteRequest(url);
  console.log(response);
  return response;
}
