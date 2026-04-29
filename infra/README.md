# Infrastructure Repository Notes

The assignment asks for a separate infrastructure repository. This `infra/`
directory contains the Kubernetes and Argo CD manifests that should be copied or
mirrored into that separate repository.

Recommended infra repository layout:

```text
infra/
  argocd/
    application.yaml
  k8s/
    namespace.yaml
    configmap.yaml
    secret.yaml
    *-deployment.yaml
    *-service.yaml
    ingress.yaml
```

Before applying Argo CD:

1. Push these manifests to the separate infra repository.
2. Update `argocd/application.yaml` with the real infra repository URL.
3. Replace placeholder secret values for the target environment.
4. Point deployment image fields to pushed registry images.

The application repository CI can update image tags in the infra repository
when these GitHub settings are configured:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `INFRA_REPO`
- `INFRA_REPO_TOKEN`
- optional `INFRA_MANIFEST_PATH`
