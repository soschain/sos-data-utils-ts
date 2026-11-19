# Organization sectors

A sector describes the activity for which an organization is applying to
participate. Use the exact sector identifier in an application and in the
resulting tenant identity. A legal entity can apply in more than one sector.
Each sector has its own admission decision and tenant identity.

## Sector catalogue

| Sector | Organizations and activities |
| --- | --- |
| `health-care` | Hospitals, clinics, medical practices and other providers of human care. |
| `health-lab` | Laboratories that provide human diagnostic, pathology or testing services. |
| `health-research` | Universities, research institutes and clinical research teams working on human health. |
| `health-tech` | Software vendors and integrators providing technology for human health services. |
| `health-insurance` | Human health insurers and authorized claims administrators. |
| `animal-care` | Veterinary clinics, hospitals, practices and mobile veterinary providers. |
| `animal-lab` | Laboratories that provide veterinary diagnostic, pathology or testing services. |
| `animal-research` | Research institutes, universities and other organizations conducting animal health or veterinary research. |
| `animal-tech` | Software vendors and integrators providing technology for veterinary and animal services. |
| `animal-insurance` | Animal insurers and authorized claims administrators. |
| `animal-breed` | Registered breeding organizations that manage animal identity, pedigrees or reproductive traceability. |
| `animal-mobility` | Organizations whose admitted activity is animal transport and the coordination of animal travel. |
| `animal-shelter` | Shelters, refuges and other legal custodians that receive, care for or arrange placement of animals. |
| `animal-farm` | Farms and other organizations legally responsible for livestock groups. |
| `animal-commerce` | Retailers and other admitted organizations engaged in animal commerce. |
| `animal-management` | Municipalities, public bodies and contracted organizations responsible for animal management, such as colony programmes. |
| `onehealth-care` | Organizations that care for and improve natural and built environments, such as habitat restoration services and municipal teams that maintain public spaces. |
| `onehealth-lab` | Laboratories that test samples or assess conditions in natural and built environments, such as water and soil quality, indoor air quality and noise in public spaces. |
| `onehealth-research` | Organizations conducting research that connects human, animal or environmental health. |
| `onehealth-tech` | Software vendors and integrators that provide technology to monitor, manage and improve natural and built environments, such as sensors for buildings and tools for managing public spaces or monitoring ecosystems. |
| `public-health` | Public health authorities and municipal services responsible for surveillance, prevention or population-health alerts. |
| `public-safety` | Municipal police and other organizations acting in a policing or traffic-enforcement capacity. Spanish examples include Policía Nacional and the Guardia Civil Traffic Group. |
| `passenger-transport` | Airlines, railway operators and other passenger carriers that participate in governed passenger or accompanying-animal workflows. |

A municipality may apply in `public-health` for its public health service, in
`public-safety` for its municipal police function, and in `animal-management`
for its animal management service. Review the function represented by each
application. A passenger carrier may apply in `passenger-transport` for
passenger workflows and in `animal-mobility` for an animal transport service.

## Admission and availability

The base identifiers come from `sos-data-utils-ts/dataspace-sectors`.
Its `cross-sector-access-policy` export defines the public health, public
safety and passenger transport contexts. Sector extensions define the
specialist animal identifiers.

An operator verifies that the target gateway enables a sector and that the
portal accepts applications for it in the target network. The host applies its
admission policy. A portal or integrator should link to this catalogue and
apply the sector list for its own deployment.

Sector selection describes an organization's admitted activity. Access to a
person's or animal's records requires separate verification of the actor,
assignment, purpose and applicable permissions. See
[Organization workflow access](ORGANIZATION_WORKFLOW_ACCESS.md).
