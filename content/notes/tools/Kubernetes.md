# Definition

Container orchestration management system.

## Architecture

* Cluster: Kubernetes instance.
* Control Plane: The brain of the cluster.
* Nodes: Machines that run services.

![](kubernetes_diagram.svg)

### Control Plane

Exposes the API for internal and external requests and maintains the global state.
* **Kube-apiserver**:
  * Communicates with users and nodes (accessible from inside and outside the Pod).
* **ETCD**:
  * Database that stores the Cluster state.
* **Kube-scheduler**:
  * Decides which Node each Pod runs on.
* **Kube-controller-manager**:
  * Maintains the desired state.

### Nodes

Virtual machines that run each service.
* **Pod**:
  * Where containers are deployed (Docker, containerd...).
  * One or more containers sharing network and storage.
* **Kubelet**:
  * Receives instructions from the API server.
  * Keeps Pods in the desired state.
* **Kube-proxy**:
  * Receives network rules and services that expose the Pod.
* **iptables**:
  * Applies the network rules from Kube-proxy.

# How It Works

"Identity → Authorization → Action" flow:

1. **Client (kubectl / pod / service account)** authenticates with the API server.
2. Receives token-based access (similar to a ticket).
3. The API server validates:
   * Authentication
   * Authorization (RBAC)
4. The state is stored in etcd.
5. The Scheduler assigns a node.
6. Kubelet runs the Pod.

If a Pod fails → it is automatically recreated (ReplicaSet / Deployment).
If a node fails → the Scheduler reschedules Pods.

# Enumeration

## Token Inside a Pod

```bash
ls /var/run/secrets/kubernetes.io/serviceaccount/
```

Typical files:
* token → Access JWT
* ca.crt → Cluster certificate
* namespace → Current namespace

## API
The API can be enumerated using `curl` with GET requests.

### API Groups

Returns a list of available API groups:

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

Core API entry points:

* `/api`: Core API group
  * No API groups
  * Core resources (pods, services, nodes, etc.)
  
* `/apis`: Extended API groups
  * API groups are always present
  
* `/logs`
* `/exec`
* `/proxy`

Common API groups:

* `rbac.authorization.k8s.io/v1`: Role-based access control.
  * `roles`: Permissions in a namespace.
  * `rolebindings`: Assigns roles to users.
  * `clusterroles`:  Global role assignments.
  
* `authorization.k8s.io/v1`: Real-time permission evaluation.
  * `selfsubjectrulesreviews`: Token's permissions.
  * `subjectaccessreviews`: Checks another user's permissions.
  * `selfsubjectaccessreviews`: Checks a specific permission.

### Resources

```json
$ curl -k -X GET -H "Authorization: Bearer $TOKEN" https://10.43.0.1:443/apis/rbac.authorization.k8s.io/v1
{
      "name": "clusterroles",
      "singularName": "clusterrole",
      "namespaced": false,
      "kind": "ClusterRole",
      "verbs": [
        "create",     // POST
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

Exposes resources such as `.../clusterroles`, `.../roles`, etc. These support requests using all methods listed in the `verbs` array.

> [!note]
> create == POST

### POST request

Minimum data:

```json
{
  "apiVersion": "<API group>/<version>",
  "kind": "<resource kind>",
  "spec": {
    "namespace": "default"
  }
}
```
