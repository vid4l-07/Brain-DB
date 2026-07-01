# Deficinicion
Sistema de orquestacion de gestion de contenedores.

## Arquitectura
-  Cluster: Instancia de Kubernetes.
- Control Plane: Cerebro del cluster.
- Nodes: maquinas que ejecutan trabajos.

![](kubernetes_diagram.svg)

### Control plane
Expone la API para solicitudes internas y externas y mantiene el estado global.
- **Kube-apiserver**:
	- Comunica usuarios y nodos (accesible desde dentro y fuera del Pod).
- **ETCD**: 
	- Base de datos que  almacena el estado del Cluster.
- **Kube-scheduler**: 
	- Decide en que Nodo se ejecuta cada Pod
- **Kube-controller-manager**: 
	- Mantiene el estado deseado.

### Nodos
Maquinas virtuales que ejecutan cada servicio.
- **Pod**: 
	- Donde se despliegan los contenedores (docker, containerd...).
	- Uno o varios contenedores compartiendo red y almacenamiento.
- **Kubelet**:
	- Recive instrucciones del API server 
	- Mantiene los Pods en el estado deseado.
- **Kube-proxy**: 
	- Recibe reglas de red y servicios que exponen el Pod.
- **iptables**: 
	- Aplica las reglas de red de Kube-proxy.

# Funcionamiento

Flujo de “identidad → autorización → acción”:
1. **Cliente (kubectl / pod / service account)** se autentica contra el API server
2. Recibe acceso basado en token (similar a ticket)
3. El API server valida:
    - Autenticación
    - Autorización (RBAC)
4. Se guarda el estado en etcd
5. Scheduler asigna nodo
6. Kubelet ejecuta el Pod

Si un Pod falla → se recrea automáticamente (ReplicaSet / Deployment)
Si un nodo cae → el scheduler reubica Pods

# Enumeración

## Token dentro de un Pod
```bash
ls /var/run/secrets/kubernetes.io/serviceaccount/
```
Archivos típicos:
- token → JWT de acceso
- ca.crt → certificado del cluster
- namespace → namespace actual
## API
Para enumerar la API se usa `curl` por GET.
### API Groups
Devuelve una lista de API groups disponibles:

```json
$ curl -X GET -k -H "Authorization: Bearer $TOKEN" https://10.43.0.1:443/apis/
{
  "kind": "APIGroupList",
  "apiVersion": "v1",
  "groups": [
    {
      "name": "apiregistration.k8s.io",
      "versions": [
        {
          "groupVersion": "apiregistration.k8s.io/v1",
          "version": "v1"
        }
      ],
      "preferredVersion": {
        "groupVersion": "apiregistration.k8s.io/v1",
        "version": "v1"
      }
    }, ...
```

Core API entry points;
- `/api`: Core API group
	- No hay API groups
	- Core resources (pods, services, nodes, etc.)
- `/apis`: Extended API groups
	- Siempre hay API groups
- `/logs`
- `/exec`
- `/proxy`

API groups comunes:
- `rbac.authorization.k8s.io/v1`: Control de acceso basado en roles.
	- `roles`: Permisos en un namespace.
	- `relebindings`: Asignación de roles a usuarios.
	- `clusterroles`: Asignación global.
- `authorization.k8s.io/v1`: Evaluación de permisos en tiempo real.
	- `selfsubjectrulesreviews`: Permisos del token.
	- `subjectaccessreviews`: Verifica permiso de otro usuario.
	- `selfsubjectaccessreviews`: Verifica permiso especifico.
### Recursos
```json
$ curl -k -X GET -H "Authorization: Bearer $TOKEN" https://10.43.0.1:443/apis/rbac.authorization.k8s.io/v1
{
      "name": "clusterroles",
      "singularName": "clusterrole",
      "namespaced": false,
      "kind": "ClusterRole",
      "verbs": [
        "create",     # POST
        "delete",
        "deletecollection",
        "get",
        "list",
        "patch",
        "update",
        "watch"
      ],
      "storageVersionHash": "bYE5ZWDrJ44="
    }, ...
```

Expone recursos como `.../clusterroles, .../roles, etc.` Estos admiten requests por todos los métodos del array `verbs`.

>[!note]
>create == POST

### POST request

Minima data:
```json
{
  "apiVersion": "<API group>/<version>",
  "kind": "<kind del recurso>",
  "spec": {
    "namespace": "default"
  }
}
```
