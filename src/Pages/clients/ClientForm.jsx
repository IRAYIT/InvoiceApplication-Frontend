import { useState } from "react";
import ClientService from "../../services/ClientService.js";
const ClientForm = () => {
  const [client, setClient] = useState({
    clientType: "company",

    company: "",
    companyRegNo: "",
    vatNo: "",

    firstName: "",
    lastName: "",
    personalIdNo: "",

    email: "",
    number: "",

    address: {
      careOf: "",
      streetAddress: "",
      zipCode: "",
      city: "",
      country: "Sweden",
    },

    deliveryAddress: {
      careOf: "",
      streetAddress: "",
      zipCode: "",
      city: "",
      country: "Sweden",
    },

    settings: {
      invoiceDeliveryMethod: "email",
      emailAttachPdf: false,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setClient({
      ...client,
      [name]: value,
    });
  };

  const handleAddress = (e) => {
    const { name, value } = e.target;

    setClient({
      ...client,
      address: {
        ...client.address,
        [name]: value,
      },
    });
  };

  const saveClient = async () => {
    try {
      await ClientService.createClient(client);
      alert("Client Created Successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="client-form">

      <h1>Clients</h1>

      <div className="section">

        <div className="left">

          <h3>General</h3>

          <div className="radio-group">

            <label>
              <input
                type="radio"
                checked={client.clientType === "company"}
                onChange={() =>
                  setClient({ ...client, clientType: "company" })
                }
              />
              Company
            </label>

            <label>
              <input
                type="radio"
                checked={client.clientType === "person"}
                onChange={() =>
                  setClient({ ...client, clientType: "person" })
                }
              />
              Person
            </label>

          </div>

          {client.clientType === "company" ? (
            <>
              <input
                name="company"
                placeholder="Company Name"
                onChange={handleChange}
              />

              <input
                name="companyRegNo"
                placeholder="Company Reg No"
                onChange={handleChange}
              />

              <input
                name="vatNo"
                placeholder="VAT No"
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <input
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
              />

              <input
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
              />

              <input
                name="personalIdNo"
                placeholder="Personal ID"
                onChange={handleChange}
              />
            </>
          )}

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
        </div>

        <div className="right">

          <h3>Billing Address</h3>

          <input
            name="careOf"
            placeholder="C/O"
            onChange={handleAddress}
          />

          <input
            name="streetAddress"
            placeholder="Address"
            onChange={handleAddress}
          />

          <input
            name="zipCode"
            placeholder="Zip Code"
            onChange={handleAddress}
          />

          <input
            name="city"
            placeholder="City"
            onChange={handleAddress}
          />

          <input
            name="country"
            placeholder="Country"
            onChange={handleAddress}
          />

        </div>

      </div>

      <button className="create-btn" onClick={saveClient}>
        Create Client
      </button>
    </div>
  );
};

export default ClientForm;