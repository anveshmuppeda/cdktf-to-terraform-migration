FROM apache/spark:3.5.1

USER root

RUN mkdir -p /tmp/.ivy2 && chmod -R 777 /tmp

# Copy job
COPY jobs /opt/spark/jobs

# PostgreSQL JDBC (optional but useful)
COPY jars/postgresql-42.7.3.jar /opt/spark/jars/postgresql.jar

# Gravitino JARs (built by you)
COPY jars/gravitino-spark-3.5_2.12-*.jar /opt/spark/jars/
COPY jars/gravitino-spark-common-*.jar /opt/spark/jars/

# Iceberg runtime (REQUIRED ✅)
ADD https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-spark-runtime-3.5_2.12/1.5.2/iceberg-spark-runtime-3.5_2.12-1.5.2.jar \
    /opt/spark/jars/

# 🔥 FIX PERMISSIONS (CRITICAL)
RUN chmod -R 755 /opt/spark/jars

ENV HOME=/tmp
ENV IVY_HOME=/tmp/.ivy2
ENV SPARK_HOME=/opt/spark

USER spark