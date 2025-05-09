FROM quay.io/keycloak/keycloak:26.2.1 as builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

ADD --chown=keycloak:keycloak ./target/*.jar /opt/keycloak/providers/
ADD --chown=keycloak:keycloak ./themes/ /opt/keycloak/themes/

FROM quay.io/keycloak/keycloak:26.2.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/
ENV KC_DB=dev-file

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
