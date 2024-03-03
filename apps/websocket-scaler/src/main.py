from kubernetes import client, config
import requests
import time

config.load_incluster_config()

k8s_apps_v1 = client.AppsV1Api()
prometheus_url = "http://prometheus-server.prometheus.svc/api/v1/query"

def get_connections_per_pod(pod_name):
    query = f'sum(websockets_connections_total{{pod="{pod_name}"}})'
    response = requests.get(f"{prometheus_url}?query={query}")
    result = response.json()['data']['result']

    if result:
        return int(result[0]['value'][1])
    return 0

def scale_based_on_connections(stateful_set_name, namespace, max_connections, max_replica_count, min_replica_count):
    stateful_set = k8s_apps_v1.read_namespaced_stateful_set(stateful_set_name, namespace)
    current_replicas = stateful_set.spec.replicas
    pod_name_prefix = f"{stateful_set_name}-"
    
    connections_list = []
    for i in range(current_replicas):
        pod_name = f"{pod_name_prefix}{i}"
        connections = get_connections_per_pod(pod_name)
        connections_list.append(connections)
        print(f"{pod_name}: {connections} connections")

    if connections_list and connections_list[-1] >= max_connections and current_replicas < max_replica_count:
        new_replicas = current_replicas + 1
        k8s_apps_v1.patch_namespaced_stateful_set_scale(
            name=stateful_set_name,
            namespace=namespace,
            body={"spec": {"replicas": new_replicas}}
        )
        print(f"Scaling up {stateful_set_name} to {new_replicas} replicas")

    elif all(con == 0 for con in connections_list[:-1]) and current_replicas > min_replica_count:
        new_replicas = current_replicas - 1
        k8s_apps_v1.patch_namespaced_stateful_set_scale(
            name=stateful_set_name,
            namespace=namespace,
            body={"spec": {"replicas": new_replicas}}
        )
        print(f"Scaling down {stateful_set_name} to {new_replicas} replicas")

stateful_set_name = "websocket"
namespace = "default"
max_connections = 10
max_replica_count = 10
min_replica_count = 1

while True:
    scale_based_on_connections(stateful_set_name, namespace, max_connections, max_replica_count, min_replica_count)
    time.sleep(5)