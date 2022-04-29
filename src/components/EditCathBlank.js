import { observer } from "mobx-react-lite";
import { Row, Col, Button } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { Context } from "../index";
import { useMediaQuery } from "react-responsive";
import { fetchItems } from "../http/ItemApi";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOneSelect, fetchSelectsAll } from "../http/SelectApi";
import { createObjSelect, createTree2 } from "../functions";
import { SEE_REPORTS_ROUTE } from "../utils/consts";
import { fetchCathResultOwn } from "../http/CathResultApi";
import { findCathStavka, getCathReportsByResult, updateCathReport } from "../http/CathReportApi";
import { fetchColvo } from "../http/ColvoSelectsApi";
import { fetchOneCathedra } from "../http/CathedraApi";
import EditCathItems from "./EditCathItems";


const EditCathBlank = observer(() => {
  const { item } = useContext(Context);
  const { cath_report } = useContext(Context);

  const navigate = useNavigate();

  const params = useParams();

  const mobile = useMediaQuery({ query: "(max-width: 1400px)" });

  const [cath, setCath] = useState('');
  const [cathId, setCathId] = useState(0);

  useEffect( () => {
     fetchItems().then((data) => {
      item.setItems(createTree2(data));
    });

     fetchCathResultOwn(params.id).then(data => {
        cath_report.setResultOne(data);
        setCathId(data.cathedraId);
    })

    getCathReportsByResult(params.id).then(async data => {
        cath_report.setReports(data);

        const itemId = await item.items.find(
            (i) => i.name === "Количество занимаемых ставок"
          ).id;

        findCathStavka(itemId).then(data => {
            item.setStavka(data.selectvalue);
        })
    })

    fetchColvo({id: params.id}).then(async data => {
       const obj = createObjSelect(data);

       for(let key in obj) {
           fetchOneSelect(Number(key)).then(async dat => {
               const cond = await cath_report.selects.find(sel => sel.id === dat.id);

               if(cond === undefined) {
                cath_report.setSelects( [...cath_report.selects, {...dat, colvo: obj[key]}] );
               }
           })
       }
    })


  }, []);

  useEffect(() => {
  if(cathId) {
    fetchOneCathedra(cathId).then(data => {
        setCath(data.name);
    })
  }
  }, [cathId])

 async function updateReport() {
      const itemId = await item.items.find(i => i.name === 'Количество занимаемых ставок').id;

      if(itemId) {
          const el = await cath_report.reports.find(c => c.itemId === itemId);
          if(el) {
            updateCathReport(el.id, {...el, selectvalue: item.stavka}).then(data => {
                alert('Кафедральный отчёт изменён!');
                window.location.reload();
            })
          }
      }

  }

  return (
    <div className="blank" style={{ marginTop: "4rem" }}>
      <Row >
        <Col style={{ textAlign: "center", backgroundColor: "#e9eff9", borderRadius: "15px"  }}>Ставка: {item.stavka} </Col>
        <Col style={{ textAlign: "center", backgroundColor: "#e9eff9", borderRadius: "15px"  }}>Общий балл: 
         {cath_report.resultOne.result} </Col>
      </Row>

      <Row className="row" style={{ marginTop: "1rem" }}>
        <Col md={6}>Кафедра</Col>
        <Col md={6}>
         {cath}
        </Col>
      </Row>
      <div
        style={{ marginTop: "2rem", marginBottom: "0.5rem" }}
        className="hr"
      ></div>

      <Row>
        <Col style={{ textAlign: "center" }} md={9}>
          Критерии
        </Col>
        <Col style={{ textAlign: "center" }} md={1}>
          Балл
        </Col>
        <Col style={{ textAlign: "center" }} md={2}>
          Статистика
        </Col>
        <Col md={1}></Col>
      </Row>

      <div style={{ marginTop: "0.5rem" }} className="hr"></div>

      <EditCathItems/>

      <Row style={{ marginTop: "3rem" }}>
        <Col lg={6}>
          <Button
          onClick={updateReport}
            style={{
              fontFamily: "var(--bs-body-font-family)",
              fontWeight: "500",
              marginTop: "15px",
            }}
            variant="primary"
          >
            Сохранить отчёт
          </Button>

          <Button
          onClick={() => navigate(SEE_REPORTS_ROUTE)}
            style={
              {
                fontFamily: "var(--bs-body-font-family)",
                fontWeight: "500",
                marginTop: "15px",
                marginLeft: '10px',
              }
            }
            variant="dark"
          >
            Отмена
          </Button>
        </Col>
        <Col lg={6}>
         
        </Col>
      </Row>
    </div>
  );
});

export default EditCathBlank;